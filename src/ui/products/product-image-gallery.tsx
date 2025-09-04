"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/shadcn/button";

interface ProductImageGalleryProps {
	images: string[];
	productName: string;
	className?: string;
}

export function ProductImageGallery({ images, productName, className }: ProductImageGalleryProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [isHovering, setIsHovering] = useState(false);

	if (!images || images.length === 0) {
		return (
			<div className={cn("aspect-square w-full rounded-lg bg-neutral-100", className)}>
				<div className="flex h-full items-center justify-center text-neutral-400">No images available</div>
			</div>
		);
	}

	const selectedImage = images[selectedImageIndex] || images[0];
	const hasPrevious = selectedImageIndex > 0;
	const hasNext = selectedImageIndex < images.length - 1;

	const goToPrevious = () => {
		setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
	};

	const goToNext = () => {
		setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
	};

	return (
		<div className={cn("space-y-4", className)}>
			{/* Main Image Display */}
			<div
				className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100"
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
			>
				<Image
					src={selectedImage}
					alt={`${productName} - Image ${selectedImageIndex + 1}`}
					fill
					className="object-cover object-center transition-transform duration-300 hover:scale-105"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					priority={selectedImageIndex === 0}
				/>

				{/* Navigation Arrows - Only show if more than 1 image */}
				{images.length > 1 && (
					<>
						<Button
							variant="secondary"
							size="icon"
							className={cn(
								"absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-opacity hover:bg-white/90",
								isHovering ? "opacity-100" : "opacity-0",
							)}
							onClick={goToPrevious}
							disabled={!hasPrevious && images.length <= 1}
						>
							<ChevronLeft className="h-5 w-5" />
							<span className="sr-only">Previous image</span>
						</Button>

						<Button
							variant="secondary"
							size="icon"
							className={cn(
								"absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-opacity hover:bg-white/90",
								isHovering ? "opacity-100" : "opacity-0",
							)}
							onClick={goToNext}
							disabled={!hasNext && images.length <= 1}
						>
							<ChevronRight className="h-5 w-5" />
							<span className="sr-only">Next image</span>
						</Button>
					</>
				)}

				{/* Image Counter */}
				{images.length > 1 && (
					<div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
						{selectedImageIndex + 1} / {images.length}
					</div>
				)}
			</div>

			{/* Thumbnail Strip - Only show if more than 1 image */}
			{images.length > 1 && (
				<div className="flex space-x-2 overflow-x-auto pb-2">
					{images.map((image, index) => (
						<button
							key={index}
							type="button"
							className={cn(
								"relative flex-shrink-0 aspect-square w-16 h-16 overflow-hidden rounded-lg border-2 transition-all duration-200",
								index === selectedImageIndex
									? "border-primary ring-2 ring-primary/20"
									: "border-neutral-200 hover:border-neutral-300",
							)}
							onClick={() => setSelectedImageIndex(index)}
						>
							<Image
								src={image}
								alt={`${productName} - Thumbnail ${index + 1}`}
								fill
								className="object-cover object-center"
								sizes="64px"
							/>
							{index === selectedImageIndex && <div className="absolute inset-0 bg-primary/10" />}
						</button>
					))}
				</div>
			)}

			{/* Mobile Swipe Indicators */}
			{images.length > 1 && (
				<div className="flex justify-center space-x-1 sm:hidden">
					{images.map((_, index) => (
						<button
							key={index}
							type="button"
							className={cn(
								"h-2 w-2 rounded-full transition-all duration-200",
								index === selectedImageIndex ? "bg-primary" : "bg-neutral-300",
							)}
							onClick={() => setSelectedImageIndex(index)}
						>
							<span className="sr-only">Go to image {index + 1}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
