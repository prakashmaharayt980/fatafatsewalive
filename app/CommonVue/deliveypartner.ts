import logoImg from '@/public/imgfile/logoimg.png';
import pathaoImg from '@/public/deliveryPartner/pathao.png';
import nepalCanMoveImg from '@/public/deliveryPartner/nepalcan-move.png';

export const deliveypartnerDetails = [
    {
        name: "Fatafat Express",
        img: logoImg,
        id: 0,
        description: "Our own premium delivery service with real-time tracking.",
        estimatedDays: "1-2 days",
        requiresUserId: false,
    },
    {
        name: "Pathao",
        img: pathaoImg,
        id: 1,
        description: "Fast and reliable delivery across Nepal.",
        estimatedDays: "2-3 days",
        requiresUserId: true,
    },
    {
        name: "Nepal Can Move",
        img: nepalCanMoveImg,
        id: 3,
        description: "Nationwide delivery with care.",
        estimatedDays: "3-5 days",
        requiresUserId: true,
    },
];