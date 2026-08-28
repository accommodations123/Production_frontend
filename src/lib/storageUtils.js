import { supabase } from '@/lib/supabaseClient';

/**
 * Upload a file directly to Supabase Storage
 * @param {File|Blob} file - The file to upload
 * @param {string} [folder='uploads'] - Subfolder inside the bucket
 * @param {string} [bucket='media'] - Bucket name
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function uploadToSupabaseStorage(file, folder = 'uploads', bucket = 'media') {
    if (!file) return null;
    if (!supabase) throw new Error('Supabase client not initialized');

    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const cleanFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(cleanFileName, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(cleanFileName);

    return publicUrl;
}

/**
 * Upload multiple files to Supabase Storage in parallel
 * @param {Array<File|Blob>} files 
 * @param {string} [folder='uploads'] 
 * @param {string} [bucket='media'] 
 * @returns {Promise<Array<string>>} Array of public URLs
 */
export async function uploadMultipleToSupabaseStorage(files, folder = 'uploads', bucket = 'media') {
    if (!files || files.length === 0) return [];
    const uploadPromises = files.map(file => {
        const fileObj = file.file || file;
        return uploadToSupabaseStorage(fileObj, folder, bucket);
    });
    return Promise.all(uploadPromises);
}
