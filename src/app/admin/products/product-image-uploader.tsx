"use client";

import type * as Commerce from "commerce-kit";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/ui/shadcn/button";
import { Input } from "@/ui/shadcn/input";

interface ProductImageUploaderProps {
	product: Commerce.MappedProduct;
}

export function ProductImageUploader({ product }: ProductImageUploaderProps) {
	const [images, setImages] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	// Get existing additional images from metadata
	const existingImages = Object.entries(product.metadata)
		.filter(([key]) => key.startsWith("image") && key !== "image1")
		.map(([key, url]) => ({ key, url }))
		.sort((a, b) => a.key.localeCompare(b.key));

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newFiles = Array.from(e.target.files);
			setImages((prev) => [...prev, ...newFiles]);
		}
	};

	const removeImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUpload = async () => {
		if (images.length === 0) {
			setMessage({ type: "error", text: "Please select at least one image to upload." });
			return;
		}

		setUploading(true);
		setMessage(null);

		try {
			const formData = new FormData();
			formData.append("productId", product.id);
			images.forEach((image, index) => {
				formData.append(`image${index}`, image);
			});

			const response = await fetch("/api/admin/upload-product-images", {
				method: "POST",
				body: formData,
			});

			const result = (await response.json()) as { error?: string; success?: boolean };

			if (response.ok) {
				setMessage({ type: "success", text: `Successfully uploaded ${images.length} images!` });
				setImages([]);
				// Refresh the page to show updated images
				window.location.reload();
			} else {
				setMessage({ type: "error", text: result.error || "Failed to upload images." });
			}
		} catch (error) {
			setMessage({ type: "error", text: "An error occurred while uploading images." });
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="space-y-4">
			{/* Existing Images */}
			{existingImages.length > 0 && (
				<div>
					<h4 className="font-medium mb-2">Current Additional Images:</h4>
					<div className="flex flex-wrap gap-2">
						{existingImages.map(({ key, url }) => (
							<div key={key} className="relative">
								<img src={url} alt={`Product ${key}`} className="w-16 h-16 object-cover rounded border" />
								<span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
									{key.replace("image", "")}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* File Upload */}
			<div>
				<label htmlFor={`file-${product.id}`} className="block text-sm font-medium mb-2">
					Upload New Images:
				</label>
				<Input
					id={`file-${product.id}`}
					type="file"
					accept="image/*"
					multiple
					onChange={handleFileChange}
					className="mb-2"
				/>
			</div>

			{/* Preview Selected Images */}
			{images.length > 0 && (
				<div>
					<h4 className="font-medium mb-2">Selected Images ({images.length}):</h4>
					<div className="flex flex-wrap gap-2 mb-4">
						{images.map((image, index) => (
							<div key={index} className="relative">
								<img
									src={URL.createObjectURL(image)}
									alt={`Preview ${index + 1}`}
									className="w-16 h-16 object-cover rounded border"
								/>
								<button
									type="button"
									onClick={() => removeImage(index)}
									className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
								>
									<X size={12} />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Upload Button */}
			<Button
				onClick={handleUpload}
				disabled={uploading || images.length === 0}
				className="flex items-center gap-2"
			>
				{uploading ? (
					<>
						<Loader2 className="w-4 h-4 animate-spin" />
						Uploading...
					</>
				) : (
					<>
						<Upload className="w-4 h-4" />
						Upload Images
					</>
				)}
			</Button>

			{/* Status Message */}
			{message && (
				<div
					className={`p-3 rounded-md text-sm ${
						message.type === "success"
							? "bg-green-50 text-green-700 border border-green-200"
							: "bg-red-50 text-red-700 border border-red-200"
					}`}
				>
					{message.text}
				</div>
			)}
		</div>
	);
}
