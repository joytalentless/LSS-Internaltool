import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

const UserListElement = Loadable(lazy(() => import('views/consumers/ConsumerLists')));
const UserDetailElement = Loadable(lazy(() => import('views/consumers/ConsumerDetails')));
const AdminListElement = Loadable(lazy(() => import('views/admins/AdminLists')));
const ProductListElement = Loadable(lazy(() => import('views/products/ProductLists')));
const ProductDetailElement = Loadable(lazy(() => import('views/products/ProductDetails')));
const VideoListElement = Loadable(lazy(() => import('views/videos/VideoLists')));
const VideoAuditElement = Loadable(lazy(() => import('views/videos/VideoAudit')));
const VariationDetailElement = Loadable(lazy(() => import('views/products/VariationDetails')));
const CurrencyListElement = Loadable(lazy(() => import('views/currency/CurrencyList')));
const CurrencyDetailElement = Loadable(lazy(() => import('views/currency/CurrencyDetails')));
const CategoryListElement = Loadable(lazy(() => import('views/categories/CategoryLists')));
const CategoryDetailElement = Loadable(lazy(() => import('views/categories/CategoryDetail')));
const ProductOrderListElement = Loadable(lazy(() => import('views/product-orders/OrderLists')));
const ProductOrderDetailElement = Loadable(lazy(() => import('views/product-orders/OrderDetails')));
const SubscriptionOrderListElement = Loadable(lazy(() => import('views/subscription-orders/OrderLists')));
const CurationListElement = Loadable(lazy(() => import('views/curation/CurationLists')));
const InquireListElement = Loadable(lazy(() => import('views/inquire/InquireLists')));
const SecurityToolElement = Loadable(lazy(() => import('views/security/SecurityTool')));
const VariantTemplatesListElement = Loadable(lazy(() => import('views/variantTemplates/TemplatesList')));
const VariantTemplatesDetailElement = Loadable(lazy(() => import('views/variantTemplates/TemplatesDetail')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/user/list',
            element: <UserListElement />
        },
        {
            path: '/user/detail',
            element: <UserDetailElement />
        },
        {
            path: '/admin/list',
            element: <AdminListElement />
        },
        {
            path: '/product/list',
            element: <ProductListElement />
        },
        {
            path: '/product/detail',
            element: <ProductDetailElement />
        },
        {
            path: '/product/new',
            element: <ProductDetailElement />
        },
        {
            path: '/video/list',
            element: <VideoListElement />
        },
        {
            path: '/video/audit',
            element: <VideoAuditElement />
        },
        {
            path: '/variation-template/list',
            element: <VariantTemplatesListElement />
        },
        {
            path: '/variation-template/detail',
            element: <VariantTemplatesDetailElement />
        },
        {
            path: '/product/variation/new',
            element: <VariationDetailElement />
        },
        {
            path: '/currency/list',
            element: <CurrencyListElement />
        },
        {
            path: '/currency/detail',
            element: <CurrencyDetailElement />
        },
        {
            path: '/category/list',
            element: <CategoryListElement />
        },
        {
            path: '/category/new',
            element: <CategoryDetailElement />
        },
        {
            path: '/category/detail',
            element: <CategoryDetailElement />
        },
        {
            path: '/order/productorder/list',
            element: <ProductOrderListElement />
        },
        {
            path: '/order/subscription/list',
            element: <SubscriptionOrderListElement />
        },
        {
            path: '/order/productorder/detail',
            element: <ProductOrderDetailElement />
        },
        {
            path: '/curation/list',
            element: <CurationListElement />
        },
        {
            path: '/inquire/list',
            element: <InquireListElement />
        },
        {
            path: '/security-tool/blockip/list',
            element: <SecurityToolElement />
        }
    ]
};

export default MainRoutes;
