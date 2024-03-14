// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
    IconApps,
    IconUserCheck,
    IconBasket,
    IconCurrency,
    IconMessages,
    IconLayoutKanban,
    IconMail,
    IconCalendar,
    IconNfc,
    IconTruckDelivery,
    IconFilter,
    IconVideo,
    IconVideoPlus,
    IconBrandProducthunt,
    IconBrandPaypay
} from '@tabler/icons';

// constant
const icons = {
    IconApps,
    IconUserCheck,
    IconBasket,
    IconCurrency,
    IconMessages,
    IconLayoutKanban,
    IconMail,
    IconCalendar,
    IconNfc,
    IconTruckDelivery,
    IconFilter,
    IconVideo,
    IconVideoPlus,
    IconBrandProducthunt,
    IconBrandPaypay
};

// ==============================|| APPLICATION MENU ITEMS ||============================== //

const breadcrumbs = {
    id: 'application',
    title: <FormattedMessage id="application" />,
    icon: icons.IconApps,
    type: 'group',
    children: [
        {
            id: 'users',
            title: <FormattedMessage id="users" />,
            icon: icons.IconUserCheck,
            type: 'collapse',
            children: [
                {
                    id: 'user',
                    title: <FormattedMessage id="user" />,
                    type: 'item',
                    url: '/user/list'
                },
                {
                    id: 'user-details',
                    title: <FormattedMessage id="user-details" />,
                    type: 'item',
                    url: '/user/detail'
                },
                {
                    id: 'admin',
                    title: <FormattedMessage id="admin" />,
                    type: 'item',
                    url: '/admin/list'
                }
            ]
        },
        {
            id: 'product',
            title: <FormattedMessage id="product" />,
            type: 'item',
            icon: icons.IconBasket,
            url: '/product/list'
        },
        {
            id: 'product-details',
            title: <FormattedMessage id="product-details" />,
            type: 'item',
            icon: icons.IconBasket,
            url: '/product/detail'
        },
        {
            id: 'product-new',
            title: <FormattedMessage id="product-new" />,
            type: 'item',
            icon: icons.IconBasket,
            url: '/product/new'
        },
        {
            id: 'product-variation-detail',
            title: <FormattedMessage id="product-variation-detail" />,
            type: 'item',
            icon: icons.IconBasket,
            url: '/product/variation/detail'
        },
        {
            id: 'product-variation-new',
            title: <FormattedMessage id="product-variation-new" />,
            type: 'item',
            icon: icons.IconBasket,
            url: '/product/variation/new'
        },
        {
            id: 'video-upload',
            title: <FormattedMessage id="video-upload" />,
            type: 'item',
            icon: icons.IconVideo,
            url: '/video/list'
        },
        {
            id: 'video-audit',
            title: <FormattedMessage id="video-audit" />,
            type: 'item',
            icon: icons.IconVideoPlus,
            url: '/video/audit'
        },
        {
            id: 'currency',
            title: <FormattedMessage id="currency" />,
            type: 'item',
            icon: icons.IconCurrency,
            url: '/currency/list'
        },
        {
            id: 'currency-details',
            title: <FormattedMessage id="currency-details" />,
            type: 'item',
            icon: icons.IconCurrency,
            url: '/currency/detail'
        },
        {
            id: 'category',
            title: <FormattedMessage id="category" />,
            type: 'item',
            icon: icons.IconCategory,
            url: '/category/list'
        },
        {
            id: 'category-new',
            title: <FormattedMessage id="New Category (Product Type)" />,
            type: 'item',
            icon: icons.IconCategory,
            url: '/category/new'
        },
        {
            id: 'category-update',
            title: <FormattedMessage id="Update Category" />,
            type: 'item',
            icon: icons.IconCategory,
            url: '/category/detail'
        },
        {
            id: 'orders',
            title: <FormattedMessage id="orders" />,
            type: 'item',
            icon: icons.IconTruckDelivery,
            url: '/order/productorder/list'
        },
        {
            id: 'order-details',
            title: <FormattedMessage id="order-details" />,
            type: 'item',
            icon: icons.IconTruckDelivery,
            url: '/order/productorder/detail'
        },
        {
            id: 'subscription-orders',
            title: <FormattedMessage id="subscription-orders" />,
            type: 'item',
            icon: icons.IconBrandPaypay,
            url: '/order/subscription/list'
        },
        {
            id: 'curation',
            title: <FormattedMessage id="curation" />,
            type: 'item',
            icon: icons.IconFilter,
            url: '/curation/list'
        },
        {
            id: 'inquire',
            title: <FormattedMessage id="inquire" />,
            type: 'item',
            icon: icons.IconBrandProducthunt,
            url: '/inquire/list'
        },
        {
            id: 'security-tool',
            title: <FormattedMessage id="security-tool" />,
            type: 'item',
            icon: icons.IconCategory,
            url: '/security-tool/blockip/list'
        },
        {
            id: 'variation-template',
            title: <FormattedMessage id="variation-template" />,
            type: 'item',
            icon: icons.IconTemplate,
            url: '/variation-template/list'
        },
        {
            id: 'variation-template-detail',
            title: <FormattedMessage id="variation-template-detail" />,
            type: 'item',
            icon: icons.IconTemplate,
            url: '/variation-template/detail'
        }
    ]
};

const menuItems = {
    items: [breadcrumbs]
};

export default menuItems;
