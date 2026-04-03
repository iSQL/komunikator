package com.cloudfrog.komunikator;

import android.media.MediaRecorder;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.File;
import java.io.FileInputStream;

@CapacitorPlugin(
    name = "NativeAudioRecorder",
    permissions = {
        @Permission(strings = { "android.permission.RECORD_AUDIO" }, alias = "microphone")
    }
)
public class NativeAudioRecorderPlugin extends Plugin {
    private MediaRecorder recorder;
    private String filePath;
    private long startTime;

    @PluginMethod
    public void start(PluginCall call) {
        try {
            filePath = getContext().getCacheDir().getAbsolutePath() + "/recording.m4a";
            recorder = new MediaRecorder(getContext());
            recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            recorder.setAudioSamplingRate(44100);
            recorder.setAudioEncodingBitRate(128000);
            recorder.setOutputFile(filePath);
            recorder.prepare();
            recorder.start();
            startTime = System.currentTimeMillis();
            call.resolve();
        } catch (Exception e) {
            if (recorder != null) {
                recorder.release();
                recorder = null;
            }
            call.reject("Failed to start recording: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            long duration = System.currentTimeMillis() - startTime;
            recorder.stop();
            recorder.release();
            recorder = null;

            File file = new File(filePath);
            byte[] bytes = new byte[(int) file.length()];
            FileInputStream fis = new FileInputStream(file);
            fis.read(bytes);
            fis.close();

            String base64 = Base64.encodeToString(bytes, Base64.NO_WRAP);

            JSObject result = new JSObject();
            result.put("base64", base64);
            result.put("mimeType", "audio/mp4");
            result.put("durationMs", duration);
            call.resolve(result);

            file.delete();
        } catch (Exception e) {
            call.reject("Failed to stop recording: " + e.getMessage());
        }
    }
}
