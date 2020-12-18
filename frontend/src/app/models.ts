export interface CameraImage {
	imageAsDataUrl: string
	imageData: Blob
}

export interface User{
	username: string
	password: string
}

export interface Share{
	username: string
	password: string
	title: string
	comments: string
	image: Blob
}