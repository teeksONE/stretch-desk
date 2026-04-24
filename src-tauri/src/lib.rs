use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
async fn show_break_overlay(
    app: tauri::AppHandle,
    exercise_id: String,
    duration: u32,
) -> Result<(), String> {
    if let Some(existing) = app.get_webview_window("break") {
        let _ = existing.close();
    }

    let url = format!("index.html#/break/{}?duration={}", exercise_id, duration);
    let window = WebviewWindowBuilder::new(&app, "break", WebviewUrl::App(url.into()))
        .title("Break Time")
        .fullscreen(true)
        .always_on_top(true)
        .decorations(false)
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
    // Just closes the break window without signaling completion.
    if let Some(w) = app.get_webview_window("break") {
        w.close().map_err(|e| e.to_string())?;
    }
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
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            show_break_overlay,
            dismiss_break,
            finish_break
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
