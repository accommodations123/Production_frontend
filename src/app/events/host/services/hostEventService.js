import { supabase } from "@/lib/supabaseClient";

// Function to compress image
export const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };

        img.src = URL.createObjectURL(file);
    });
};

export const hostEventService = {
    getEventById: async (id) => {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return { event: data, data };
    },
    createDraft: async (data) => {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: result, error } = await supabase
            .from('events')
            .insert({ ...(data || {}), host_id: session?.user?.id, status: 'draft' })
            .select()
            .maybeSingle();
        if (error) throw error;
        return { event: result, data: result };
    },
    updateBasicInfo: async (id, data) => {
        const { data: result, error } = await supabase.from('events').update(data).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return { event: result };
    },
    updateLocation: async (id, data) => {
        const { data: result, error } = await supabase.from('events').update(data).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return { event: result };
    },
    updateVenue: async (id, data) => {
        const { data: result, error } = await supabase.from('events').update(data).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return { event: result };
    },
    updateSchedule: async (id, data) => {
        const { data: result, error } = await supabase.from('events').update(data).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return { event: result };
    },
    updatePricing: async (id, price) => {
        const { data: result, error } = await supabase.from('events').update({ price }).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return { event: result };
    },
    submitEvent: async (id) => {
        const { data: result, error } = await supabase.from('events').update({ status: 'pending_approval' }).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return { event: result, success: true };
    },
    uploadMedia: async (id, bannerImage, galleryImages, onProgress) => {
        return { success: true };
    }
};
