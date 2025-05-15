export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  fullDescription: string;
  imageSrc: string;
  category: string;
  stock: number;
  features?: string[];
  active: boolean;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Website Template",
    price: 49.99,
    description: "Professional responsive website template for businesses.",
    fullDescription: "Our Premium Website Template provides a professional and responsive design perfect for businesses of all sizes. The template includes multiple page layouts, custom sections, and is fully responsive across all devices. Built with modern web standards and optimized for performance, this template will give your business the online presence it deserves.",
    imageSrc: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "templates",
    stock: 999,
    features: [
      "Fully responsive design",
      "Multiple page layouts",
      "SEO optimized",
      "Fast loading speed",
      "Easy customization"
    ],
    active: true
  },
  {
    id: "2",
    name: "E-commerce Starter Kit",
    price: 89.99,
    description: "Complete e-commerce solution to start selling online quickly.",
    fullDescription: "The E-commerce Starter Kit is a comprehensive solution for businesses looking to start selling online. This package includes a professionally designed e-commerce website template, product catalog management, shopping cart functionality, and secure checkout options. With our starter kit, you can have your online store up and running in no time, allowing you to focus on growing your business.",
    imageSrc: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "e-commerce",
    stock: 50,
    features: [
      "Product catalog management",
      "Shopping cart functionality",
      "Secure checkout",
      "Inventory tracking",
      "Mobile-friendly design",
      "Payment gateway integration"
    ],
    active: true
  },
  {
    id: "3",
    name: "Portfolio Builder Pro",
    price: 29.99,
    description: "Showcase your work with this professional portfolio solution.",
    fullDescription: "Portfolio Builder Pro is designed for creatives and professionals who want to showcase their work in a stunning online portfolio. This template includes beautiful gallery layouts, project detail pages, and contact forms to help you present your work professionally. Whether you're a photographer, designer, artist, or any other creative professional, this portfolio solution will help you stand out from the crowd and attract new clients.",
    imageSrc: "https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "portfolio",
    stock: 75,
    features: [
      "Multiple gallery layouts",
      "Project detail pages",
      "Contact form integration",
      "Social media links",
      "Client testimonial section",
      "Blog capability"
    ],
    active: true
  },
  {
    id: "4",
    name: "Business Analytics Dashboard",
    price: 119.99,
    description: "Powerful dashboard to monitor and analyze your business metrics.",
    fullDescription: "The Business Analytics Dashboard provides a comprehensive view of your business metrics in real-time. This powerful tool allows you to track sales, customer engagement, inventory levels, and more through intuitive visualizations and reports. Make data-driven decisions with ease as you monitor key performance indicators and identify trends that affect your business. The dashboard is customizable to focus on the metrics that matter most to your specific business needs.",
    imageSrc: "https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "business",
    stock: 30,
    features: [
      "Real-time metrics tracking",
      "Customizable dashboards",
      "Sales and revenue reports",
      "Customer behavior analytics",
      "Inventory monitoring",
      "Export and sharing capabilities"
    ],
    active: true
  },
  {
    id: "5",
    name: "Content Management System",
    price: 79.99,
    description: "Easy-to-use CMS for managing your website content without coding.",
    fullDescription: "Our Content Management System (CMS) makes it simple to update and manage your website content without any coding knowledge. With an intuitive interface, you can easily add, edit, and organize pages, blog posts, images, and other content. The system includes user management, allowing you to assign different access levels to team members. Keep your website fresh and up-to-date with our powerful yet user-friendly CMS.",
    imageSrc: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "cms",
    stock: 60,
    features: [
      "Intuitive content editor",
      "Media management",
      "User role management",
      "SEO tools",
      "Content scheduling",
      "Version history"
    ],
    active: true
  }
];

export interface WebPage {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageSrc: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export const mockWebPages: WebPage[] = [
  {
    id: "1",
    userId: "2",
    title: "My Professional Portfolio",
    content: "Welcome to my professional portfolio! I'm a creative designer with over 5 years of experience in brand identity and UI/UX design. My work focuses on creating clean, user-friendly designs that communicate effectively.",
    imageSrc: "https://images.pexels.com/photos/3194518/pexels-photo-3194518.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    isPublic: true,
    createdAt: "2023-03-10T15:30:00Z",
    updatedAt: "2023-03-15T09:45:00Z",
    url: "/users/user"
  },
  {
    id: "2",
    userId: "2",
    title: "My Photography Showcase",
    content: "A collection of my best photography work over the past year. I specialize in landscape and nature photography, capturing the beauty of natural environments around the world.",
    imageSrc: "https://images.pexels.com/photos/1261731/pexels-photo-1261731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    isPublic: false,
    createdAt: "2023-04-20T10:15:00Z",
    updatedAt: "2023-04-22T16:30:00Z",
    url: "/users/user/photography"
  }
];

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  createdAt: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    userId: "2",
    items: [
      {
        productId: "1",
        name: "Premium Website Template",
        price: 49.99,
        quantity: 1
      },
      {
        productId: "3",
        name: "Portfolio Builder Pro",
        price: 29.99,
        quantity: 1
      }
    ],
    total: 79.98,
    status: 'delivered',
    shippingAddress: {
      street: "Main Street",
      number: "123",
      neighborhood: "Downtown",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    paymentMethod: "Credit Card",
    createdAt: "2023-05-15T09:30:00Z"
  },
  {
    id: "ORD-002",
    userId: "2",
    items: [
      {
        productId: "2",
        name: "E-commerce Starter Kit",
        price: 89.99,
        quantity: 1
      }
    ],
    total: 89.99,
    status: 'shipped',
    shippingAddress: {
      street: "Broadway",
      number: "456",
      complement: "Apt 7B",
      neighborhood: "Theater District",
      city: "New York",
      state: "NY",
      zipCode: "10019"
    },
    paymentMethod: "PayPal",
    createdAt: "2023-06-20T14:15:00Z"
  },
  {
    id: "ORD-003",
    userId: "1",
    items: [
      {
        productId: "4",
        name: "Business Analytics Dashboard",
        price: 119.99,
        quantity: 1
      },
      {
        productId: "5",
        name: "Content Management System",
        price: 79.99,
        quantity: 2
      }
    ],
    total: 279.97,
    status: 'pending',
    shippingAddress: {
      street: "Tech Avenue",
      number: "789",
      neighborhood: "Silicon District",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105"
    },
    paymentMethod: "Credit Card",
    createdAt: "2023-07-10T11:45:00Z"
  }
];

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  isActive: boolean;
}

export const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    expiryDate: "2023-12-31T23:59:59Z",
    isActive: true
  },
  {
    id: "2",
    code: "FREESHIP",
    discountType: "fixed",
    discountValue: 10,
    expiryDate: "2023-10-31T23:59:59Z",
    isActive: true
  },
  {
    id: "3",
    code: "SUMMER25",
    discountType: "percentage",
    discountValue: 25,
    expiryDate: "2023-08-31T23:59:59Z",
    isActive: false
  }
];