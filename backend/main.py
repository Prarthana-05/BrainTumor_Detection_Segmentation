import tensorflow as tf
import numpy as np
import cv2
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Constants ────────────────────────────────────────────────
IMG_SIZE    = 256
CLASSES     = ["glioma", "meningioma", "no_tumor", "pituitary"]
CLF_PATH = "efficientnet_clf_brisc.keras"
SEG_PATH    = "resunet_seg_brisc.keras"

# ── Load Models ──────────────────────────────────────────────
print("[INFO] Loading classification model...")
clf_model = tf.keras.models.load_model(CLF_PATH, compile=False)
print("[INFO] Classification model loaded!")

print("[INFO] Loading segmentation model...")
seg_model = tf.keras.models.load_model(SEG_PATH, compile=False)
print("[INFO] Segmentation model loaded!")


# ── Preprocessing ────────────────────────────────────────────
def preprocess_clf(img_rgb):
    """EfficientNetB3: resize + rescale 0-1"""
    img = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    return np.expand_dims(img, axis=0).astype(np.float32)

def preprocess_seg(img_rgb):
    """ResUNet: resize + standardize"""
    img = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE)).astype(np.float64)
    img = (img - img.mean()) / (img.std() + 1e-8)
    return np.expand_dims(img, axis=0)

def overlay_mask(image, mask):
    mask_resized = cv2.resize(mask, (image.shape[1], image.shape[0]))
    colored = np.zeros_like(image)
    colored[:, :, 0] = mask_resized * 180  # blue
    colored[:, :, 1] = mask_resized * 60   # slight green tint
    return cv2.addWeighted(image, 1.0, colored, 0.4, 0)

def calculate_area(mask):
    pixel_count = int(np.sum(mask))
    total = mask.shape[0] * mask.shape[1]
    return round((pixel_count / total) * 100, 2)



# @app.post("/detect")
# async def detect_tumor(file: UploadFile = File(...)):
#     try:
#         input_path = f"static/in_{file.filename}"
#         with open(input_path, "wb") as f:
#             f.write(await file.read())

#         img_bgr = cv2.imread(input_path)
#         if img_bgr is None:
#             raise ValueError("Invalid image")

#         img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

#         # Classification
#         img_clf = preprocess_clf(img_rgb)
#         preds   = clf_model.predict(img_clf, verbose=0)
#         class_idx   = int(np.argmax(preds[0]))
#         confidence  = float(preds[0][class_idx])
#         prediction  = CLASSES[class_idx]

#         class_probabilities = {
#             "glioma":      float(preds[0][0]),
#             "meningioma":  float(preds[0][1]),
#             "no_tumor":    float(preds[0][2]),
#             "pituitary":   float(preds[0][3]),
#         }

#         # GradCAM (optional — skipped for EfficientNet simplicity, returns None)
#         result_url   = None
#         gradcam_error = None

#         try:
#             # EfficientNetB3 last conv layer
#             last_conv = None
#             for layer in reversed(clf_model.layers):
#                 if isinstance(layer, tf.keras.layers.Conv2D):
#                     last_conv = layer.name
#                     break

#             grad_model = tf.keras.models.Model(
#                 inputs=clf_model.input,
#                 outputs=[clf_model.get_layer("top_conv").output, clf_model.output]
#             )

#             with tf.GradientTape() as tape:
#                 conv_out, predictions = grad_model(img_clf)
#                 loss = predictions[:, class_idx]

#             grads       = tape.gradient(loss, conv_out)
#             pooled      = tf.reduce_mean(grads, axis=(0, 1, 2))
#             heatmap     = conv_out[0] @ pooled[..., tf.newaxis]
#             heatmap     = tf.squeeze(heatmap)
#             heatmap     = tf.maximum(heatmap, 0)
#             max_val     = tf.reduce_max(heatmap)

#             if max_val > 0:
#                 heatmap = (heatmap / max_val).numpy()
#                 heatmap = cv2.resize(heatmap, (img_bgr.shape[1], img_bgr.shape[0]))
#                 heatmap = np.uint8(255 * heatmap)
#                 heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
#                 result_img    = cv2.addWeighted(img_bgr, 0.6, heatmap_color, 0.4, 0)
#                 out_path      = f"static/out_{file.filename}"
#                 cv2.imwrite(out_path, result_img)
#                 result_url    = f"http://localhost:8000/{out_path}"

#         except Exception as e:
#             gradcam_error = str(e)

#         response = {
#             "prediction":         prediction,
#             "confidence":         confidence,
#             "class_probabilities": class_probabilities,
#         }
#         if result_url:   response["result_url"]    = result_url
#         if gradcam_error: response["gradcam_error"] = gradcam_error

#         return response

#     except Exception as e:
#         import traceback; traceback.print_exc()
#         return JSONResponse(status_code=500,
#                             content={"error": "Detection failed", "details": str(e)})



# async def detect_tumor(file: UploadFile = File(...)):
#     try:
#         input_path = f"static/in_{file.filename}"
#         with open(input_path, "wb") as f:
#             f.write(await file.read())

#         img_bgr = cv2.imread(input_path)
#         if img_bgr is None:
#             raise ValueError("Invalid image")

#         img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
#         img_clf = preprocess_clf(img_rgb)

#         # ── Prediction ───────────────────────────────────────
#         preds      = clf_model.predict(img_clf, verbose=0)
#         class_idx  = int(np.argmax(preds[0]))
#         confidence = float(preds[0][class_idx])
#         prediction = CLASSES[class_idx]

#         class_probabilities = {
#             "glioma":     float(preds[0][0]),
#             "meningioma": float(preds[0][1]),
#             "no_tumor":   float(preds[0][2]),
#             "pituitary":  float(preds[0][3]),
#         }

#         # ── Uncertainty ──────────────────────────────────────
#         entropy     = -np.sum(preds[0] * np.log(preds[0] + 1e-8))
#         max_entropy = np.log(4)
#         uncertainty = round(float(entropy / max_entropy) * 100, 2)
#         uncertainty_label = "Low" if uncertainty < 25 else "Moderate" if uncertainty < 60 else "High"

#         # ── GradCAM ──────────────────────────────────────────
#         result_url = None
#         xai_error  = None

#         try:
#             grad_model = tf.keras.models.Model(
#                 inputs=clf_model.input,
#                 outputs=[clf_model.get_layer("top_conv").output, clf_model.output]
#             )

#             img_tensor = tf.constant(img_clf, dtype=tf.float32)

#             with tf.GradientTape() as tape:
#                 tape.watch(img_tensor)
#                 conv_out, predictions_gc = grad_model(img_tensor)
#                 tape.watch(conv_out)
#                 loss = predictions_gc[:, class_idx]

#             grads   = tape.gradient(loss, conv_out)
#             pooled  = tf.reduce_mean(grads, axis=(0, 1, 2))
#             heatmap = tf.reduce_mean(tf.multiply(pooled, conv_out[0]), axis=-1)
#             heatmap = tf.maximum(heatmap, 0)
#             max_val = tf.reduce_max(heatmap)

#             if max_val > 0:
#                 heatmap       = (heatmap / max_val).numpy()
#                 heatmap[heatmap < 0.3] = 0
#                 heatmap       = cv2.resize(heatmap, (img_bgr.shape[1], img_bgr.shape[0]))
#                 heatmap       = np.uint8(255 * heatmap)
#                 heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
#                 result_img    = cv2.addWeighted(img_bgr, 0.7, heatmap_color, 0.3, 0)
#                 out_path      = f"static/out_{file.filename}"
#                 cv2.imwrite(out_path, result_img)
#                 result_url    = f"http://localhost:8000/{out_path}"

#         except Exception as e:
#             xai_error = str(e)

#         response = {
#             "prediction":          prediction,
#             "confidence":          confidence,
#             "class_probabilities": class_probabilities,
#             "uncertainty":         uncertainty,
#             "uncertainty_label":   uncertainty_label,
#         }
#         if result_url: response["result_url"] = result_url
#         if xai_error:  response["xai_error"]  = xai_error

#         return response

#     except Exception as e:
#         import traceback; traceback.print_exc()
#         return JSONResponse(status_code=500,
#                             content={"error": "Detection failed", "details": str(e)})





@app.post("/detect")
async def detect_tumor(file: UploadFile = File(...)):
    try:
        input_path = f"static/in_{file.filename}"
        with open(input_path, "wb") as f:
            f.write(await file.read())

        img_bgr = cv2.imread(input_path)
        if img_bgr is None:
            raise ValueError("Invalid image")

        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_clf = preprocess_clf(img_rgb)

        # ── Prediction ───────────────────────────────────────
        preds      = clf_model.predict(img_clf, verbose=0)
        class_idx  = int(np.argmax(preds[0]))
        confidence = float(preds[0][class_idx])
        prediction = CLASSES[class_idx]

        class_probabilities = {
            "glioma":     float(preds[0][0]),
            "meningioma": float(preds[0][1]),
            "no_tumor":   float(preds[0][2]),
            "pituitary":  float(preds[0][3]),
        }

        # ── Uncertainty ──────────────────────────────────────
        entropy           = -np.sum(preds[0] * np.log(preds[0] + 1e-8))
        max_entropy       = np.log(4)
        uncertainty       = round(float(entropy / max_entropy) * 100, 2)
        uncertainty_label = "Low" if uncertainty < 25 else "Moderate" if uncertainty < 60 else "High"

        # ── Occlusion XAI ────────────────────────────────────
        result_url = None
        xai_error  = None

        try:
            PATCH_SIZE = 32
            STRIDE     = 16
            h, w       = IMG_SIZE, IMG_SIZE
            occ_map    = np.zeros((h, w), dtype=np.float32)
            count_map  = np.zeros((h, w), dtype=np.float32)
            base_conf  = float(preds[0][class_idx])
            img_arr    = img_clf[0].copy()

            for y in range(0, h - PATCH_SIZE + 1, STRIDE):
                for x in range(0, w - PATCH_SIZE + 1, STRIDE):
                    occluded = img_arr.copy()
                    occluded[y:y+PATCH_SIZE, x:x+PATCH_SIZE, :] = 0
                    occ_input = np.expand_dims(occluded, axis=0).astype(np.float32)
                    occ_preds = clf_model.predict(occ_input, verbose=0)
                    drop      = base_conf - float(occ_preds[0][class_idx])
                    occ_map[y:y+PATCH_SIZE, x:x+PATCH_SIZE]   += drop
                    count_map[y:y+PATCH_SIZE, x:x+PATCH_SIZE] += 1

            count_map = np.where(count_map == 0, 1, count_map)
            occ_map   = occ_map / count_map
            occ_min, occ_max = occ_map.min(), occ_map.max()
            if occ_max - occ_min > 0:
                occ_map = (occ_map - occ_min) / (occ_max - occ_min)
            occ_map[occ_map < 0.3] = 0

            occ_resized = cv2.resize(occ_map, (img_bgr.shape[1], img_bgr.shape[0]))
            occ_uint8   = np.uint8(255 * occ_resized)
            occ_color   = cv2.applyColorMap(occ_uint8, cv2.COLORMAP_JET)
            result_img  = cv2.addWeighted(img_bgr, 0.6, occ_color, 0.4, 0)
            out_path    = f"static/out_{file.filename}"
            cv2.imwrite(out_path, result_img)
            result_url  = f"http://localhost:8000/{out_path}"

        except Exception as e:
            xai_error = str(e)

        response = {
            "prediction":          prediction,
            "confidence":          confidence,
            "class_probabilities": class_probabilities,
            "uncertainty":         uncertainty,
            "uncertainty_label":   uncertainty_label,
        }
        if result_url: response["result_url"] = result_url
        if xai_error:  response["xai_error"]  = xai_error

        return response

    except Exception as e:
        import traceback; traceback.print_exc()
        return JSONResponse(status_code=500,
                            content={"error": "Detection failed", "details": str(e)})

                            



# ── /segment endpoint ────────────────────────────────────────
@app.post("/segment")
async def segment_tumor(file: UploadFile = File(...)):
    try:
        input_path = f"static/in_seg_{file.filename}"
        with open(input_path, "wb") as f:
            f.write(await file.read())

        img_bgr = cv2.imread(input_path)
        if img_bgr is None:
            raise ValueError("Invalid image")

        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        # ── Step 1: Classify first (gatekeeper) ──────────────
        img_clf    = preprocess_clf(img_rgb)
        preds      = clf_model.predict(img_clf, verbose=0)
        class_idx  = int(np.argmax(preds[0]))
        prediction = CLASSES[class_idx]

        # ── Step 2: Segment ───────────────────────────────────
        img_seg  = preprocess_seg(img_rgb)
        mask_raw = seg_model.predict(img_seg, verbose=0)[0, :, :, 0]
        mask_bin = (mask_raw > 0.5).astype(np.uint8)
        area_pct = calculate_area(mask_bin)

        # ── Step 3: Gatekeeper — zero mask if no_tumor ───────
        if prediction == "no_tumor" or area_pct < 0.2:
            return {
                "tumor_area":     0,
                "area_percent":   0.0,
                "max_diameter_cm": 0.0,
                "message":        "No significant tumor region detected"
            }

        # ── Step 4: Contour analysis ──────────────────────────
        contours, _ = cv2.findContours(mask_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        max_diameter_px = 0
        for c in contours:
            _, _, w, h = cv2.boundingRect(c)
            max_diameter_px = max(max_diameter_px, max(w, h))

        tumor_area_px   = int(np.sum(mask_bin))
        tumor_area_cm2  = round(tumor_area_px * 0.0004, 2)
        max_diameter_cm = round(max_diameter_px * 0.05, 2)

        # ── Step 5: Overlay & save ────────────────────────────
        overlay    = overlay_mask(img_bgr, mask_bin)
        output_path = f"static/out_seg_{file.filename}"
        cv2.imwrite(output_path, overlay)

        return {
            "tumor_area":      tumor_area_px,
            "tumor_area_cm2":  tumor_area_cm2,
            "area_percent":    area_pct,
            "max_diameter_cm": max_diameter_cm,
            "result_url":      f"http://localhost:8000/{output_path}"
        }

    except Exception as e:
        import traceback; traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})