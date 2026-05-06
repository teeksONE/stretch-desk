use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

fn close_warning(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("warning") {
        let _ = w.close();
    }
}

fn restore_main(app: &tauri::AppHandle) {
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
}

// Returns the (x, y, w, h) of the monitor the cursor is currently on,
// in logical pixels. Falls back to the primary monitor, then to 1080p at origin.
fn active_monitor_bounds(app: &tauri::AppHandle) -> (f64, f64, f64, f64) {
    let cursor = app.cursor_position().ok();
    let monitor = cursor
        .and_then(|c| {
            app.available_monitors().ok().and_then(|monitors| {
                monitors.into_iter().find(|m| {
                    let mp = m.position();
                    let ms = m.size();
                    c.x >= mp.x as f64
                        && c.x < mp.x as f64 + ms.width as f64
                        && c.y >= mp.y as f64
                        && c.y < mp.y as f64 + ms.height as f64
                })
            })
        })
        .or_else(|| app.primary_monitor().ok().flatten());

    match monitor {
        Some(m) => {
            let pos = m.position();
            let size = m.size();
            let scale = m.scale_factor();
            (
                pos.x as f64 / scale,
                pos.y as f64 / scale,
                size.width as f64 / scale,
                size.height as f64 / scale,
            )
        }
        None => (0.0, 0.0, 1920.0, 1080.0),
    }
}

#[tauri::command]
async fn show_break_overlay(
    app: tauri::AppHandle,
    exercise_id: String,
    duration: u32,
) -> Result<(), String> {
    close_warning(&app);

    if let Some(existing) = app.get_webview_window("break") {
        let _ = existing.close();
    }

    // Hide the main timer window so the overlay's lockout can't be bypassed
    // by hitting Stop on the still-visible main window.
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.hide();
    }

    // Cover the active monitor without using macOS native fullscreen, which
    // creates a new Space and can produce a system sound when triggered from
    // inside Mission Control.
    let (x, y, w, h) = active_monitor_bounds(&app);

    let url = format!("index.html#/break/{}?duration={}", exercise_id, duration);
    let window = WebviewWindowBuilder::new(&app, "break", WebviewUrl::App(url.into()))
        .title("Break Time")
        .inner_size(w, h)
        .position(x, y)
        .always_on_top(true)
        .decorations(false)
        .resizable(false)
        .skip_taskbar(true)
        .focused(true)
        .build()
        .map_err(|e| e.to_string())?;

    let _ = window.set_focus();
    Ok(())
}

#[tauri::command]
async fn dismiss_break(app: tauri::AppHandle) -> Result<(), String> {
    // Used when the user clicks Stop on the main timer.
    // Closes the break and warning windows without signaling completion.
    close_warning(&app);
    if let Some(w) = app.get_webview_window("break") {
        w.close().map_err(|e| e.to_string())?;
    }
    restore_main(&app);
    Ok(())
}

#[tauri::command]
async fn finish_break(app: tauri::AppHandle) -> Result<(), String> {
    // Called when the user completes or skips a break.
    // Closes the break window AND notifies the main window
    // so the timer store can return to idle.
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.emit("break-finished", ());
    }
    if let Some(w) = app.get_webview_window("break") {
        w.close().map_err(|e| e.to_string())?;
    }
    restore_main(&app);
    Ok(())
}

#[tauri::command]
async fn show_warning_pill(app: tauri::AppHandle, seconds: u32) -> Result<(), String> {
    if let Some(existing) = app.get_webview_window("warning") {
        let _ = existing.close();
    }

    let width: f64 = 240.0;
    let height: f64 = 72.0;
    let margin: f64 = 24.0;

    let (x, y) = match app.primary_monitor().map_err(|e| e.to_string())? {
        Some(m) => {
            let size = m.size();
            let scale = m.scale_factor();
            let logical_w = (size.width as f64) / scale;
            (logical_w - width - margin, margin)
        }
        None => (1000.0, margin),
    };

    let url = format!("index.html#/warning?seconds={}", seconds);
    let _window = WebviewWindowBuilder::new(&app, "warning", WebviewUrl::App(url.into()))
        .title("Heads up")
        .inner_size(width, height)
        .position(x, y)
        .always_on_top(true)
        .decorations(false)
        .skip_taskbar(true)
        .resizable(false)
        .focused(false)
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn close_warning_pill(app: tauri::AppHandle) -> Result<(), String> {
    close_warning(&app);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            show_break_overlay,
            dismiss_break,
            finish_break,
            show_warning_pill,
            close_warning_pill
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
