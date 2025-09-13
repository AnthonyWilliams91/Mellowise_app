/**
 * Cloudinary Asset Storage Configuration
 * 
 * Handles image/asset uploads and optimization for LSAT content,
 * user avatars, and generated visual materials.
 * 
 * @author Dev Agent James
 * @version 1.0
 */

import { v2 as cloudinary } from 'cloudinary'

// Validate environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    'Cloudinary environment variables missing. Asset uploads will be disabled.'
  )
} else {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

/**
 * Upload asset to Cloudinary with optimization
 */
export async function uploadAsset(
  file: File | string,
  options: {
    folder?: string
    public_id?: string
    transformation?: object[]
    resource_type?: 'image' | 'video' | 'raw'
  } = {}
) {
  try {
    const result = await cloudinary.uploader.upload(
      typeof file === 'string' ? file : await fileToDataURL(file),
      {
        folder: options.folder || 'mellowise',
        public_id: options.public_id,
        resource_type: options.resource_type || 'auto',
        transformation: options.transformation || [
          { quality: 'auto:best' },
          { fetch_format: 'auto' },
        ],
      }
    )

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload asset')
  }
}

/**
 * Generate optimized URL for existing asset
 */
export function getOptimizedUrl(
  public_id: string,
  transformations: object[] = []
) {
  if (!cloudName) {
    throw new Error('Cloudinary not configured')
  }

  return cloudinary.url(public_id, {
    transformation: [
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
      ...transformations,
    ],
  })
}

/**
 * Delete asset from Cloudinary
 */
export async function deleteAsset(public_id: string) {
  try {
    const result = await cloudinary.uploader.destroy(public_id)
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

// Helper function to convert File to data URL
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export { cloudinary }