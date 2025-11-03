// src/components/ProductImage.jsx
export default function ProductImage({ imageUrl, name, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}