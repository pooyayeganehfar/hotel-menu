'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const foods = [
  { name: 'چلو کباب', image: '/images/kabab.jpg' },
  { name: 'قرمه سبزی', image: '/images/ghorme.jpg' },
  { name: 'قیمه نثار', image: '/images/qeymeh.jpg' },
  { name: 'زرشک پلو', image: '/images/zereshk.jpg' },
  { name: 'سوپ جو', image: '/images/soup.jpg' },
];

export default function FoodSlider() {
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      loop={true}
      pagination={{ clickable: true }}
      navigation={true}
      autoplay={{ delay: 3000 }}
      modules={[Pagination, Navigation, Autoplay]}
      className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl"
    >
      {foods.map((food, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-64 bg-black">
            <img
              src={food.image}
              alt={food.name}
              className="object-cover w-full h-full opacity-80"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white text-xl text-center">
              {food.name}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}