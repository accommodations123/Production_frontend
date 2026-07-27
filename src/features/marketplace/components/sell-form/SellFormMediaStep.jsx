import { Camera, X, Loader2 } from "lucide-react";

export function SellFormMediaStep({
  images,
  uploadingImage,
  fileInputRef,
  onFileSelect,
  onRemoveImage,
  onDrop,
  onDragOver,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Product Photos (Max 5)
        </label>

        {/* Drag and Drop Zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload product photos"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            {uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Click or drag photos here to upload
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              PNG, JPG, WEBP up to 10MB (Automatically compressed)
            </p>
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2.5 mt-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                <img
                  src={img}
                  alt={`Product preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(index);
                  }}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
