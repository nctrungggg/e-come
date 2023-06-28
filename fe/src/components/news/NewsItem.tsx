type NewsItemProps = {
  image: string;
  title: string;
  datePost: string;
  category: string;
};

const NewsItem = ({ image, title, datePost, category }: NewsItemProps) => {
  return (
    <>
      <div className="flex-col pr-4 pl-4 pt-8 justify-center items-center cursor-pointer">
        <div className="relative">
          <img src={image} alt={title} />
        </div>
        <p className="pt-2 text-[#787679]">{category}</p>
        <p className="pt-2 font-bold">{title}</p>
        <p className="pt-2">{datePost}</p>
      </div>
    </>
  );
};

export default NewsItem;
