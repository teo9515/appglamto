import Link from "next/link";

interface CardAdminProps {
  title: string;
  description: string;
  href: string;
}

export default function CardAdmin({
  title,
  description,
  href,
}: CardAdminProps) {
  return (
    <Link href={href}>
      <div className="bg-[#AEBD77] flex flex-col justify-center items-center rounded-2xl shadow-md shadow-black w-full max-w-2xl h-48 lg:w-10/12 text-center hover:shadow-lg hover:scale-101 transition-shadow cursor-pointer">
        <div className="w-10/12">
          <h2 className="text-3xl text-[#163020] font-semibold mb-2">
            {title}
          </h2>
          <p className="text-[#163020] text-xl text-justify">{description}</p>
        </div>
      </div>
    </Link>
  );
}
