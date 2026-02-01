import { apiPrivate } from "./client";

export const WishlistService = {
    async getWishlist() {
        const response = await apiPrivate.get('/v1/wishlist');
        return response.data;
    },

    async addToWishlist(product_id: number) {
        const response = await apiPrivate.post('/v1/wishlist', { product_id });
        return response.data;
    },

    async removeFromWishlist(id: number) {
        const response = await apiPrivate.delete(`/v1/wishlist/${id}`);
        return response.data;
    }
}
