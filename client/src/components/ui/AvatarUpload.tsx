import React, { useState, useRef } from 'react';

interface AvatarUploadProps {
    currentAvatar?: string;
    onAvatarChange: (file: File | null) => void;
    disabled?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
    currentAvatar,
    onAvatarChange,
    disabled = false
}) => {
    const [preview, setPreview] = useState<string | null>(currentAvatar || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must be less than 2MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            onAvatarChange(file);
        }
    };

    const handleRemoveAvatar = () => {
        setPreview(null);
        onAvatarChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Avatar Display */}
            <div
                className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 ${!disabled ? 'cursor-pointer hover:border-primary-500' : ''
                    } transition-colors`}
                onClick={handleClick}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl text-gray-400">👤</span>
                    </div>
                )}

                {/* Upload Overlay */}
                {!disabled && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium">
                            {preview ? 'Change' : 'Upload'}
                        </span>
                    </div>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            {/* Action Buttons */}
            <div className="flex space-x-2">
                {!disabled && (
                    <button
                        type="button"
                        onClick={handleClick}
                        className="btn btn-secondary text-sm"
                    >
                        {preview ? 'Change Avatar' : 'Upload Avatar'}
                    </button>
                )}

                {preview && !disabled && (
                    <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="btn btn-secondary text-sm text-red-600 hover:bg-red-50"
                    >
                        Remove
                    </button>
                )}
            </div>

            {/* File Requirements */}
            {!disabled && (
                <p className="text-xs text-gray-500 text-center">
                    Upload an image (max 2MB)
                </p>
            )}
        </div>
    );
};