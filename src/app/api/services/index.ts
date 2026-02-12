// Client API Services - Barrel Export
import { apiPublic, apiPrivate, n8nApi } from './client';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { AddressService } from './address.service';
import { ProfileService } from './profile.service';
import { BlogService } from './blog.service';
import { MiscService } from './misc.service';
import { PaymentService } from './payments.service';

// Combined RemoteServices object for backward compatibility
const RemoteServices = {
    // Auth
    ...AuthService,

    // Product
    ...ProductService,

    // Category (also includes getBrandsAll)
    ...CategoryService,

    // Cart
    ...CartService,

    // Order
    ...OrderService,

    // Address
    ...AddressService,

    // Profile
    ...ProfileService,

    // Blog
    ...BlogService,

    // Misc (Navbar, Banner, Chatbot, EMI)
    ...MiscService,

    // Payment
    ...PaymentService,
};

export { apiPublic, apiPrivate, n8nApi };
export default RemoteServices;

// Also export individual services for more granular imports
export {
    AuthService,
    ProductService,
    CategoryService,
    CartService,
    OrderService,
    AddressService,
    ProfileService,
    BlogService,
    MiscService,
};
