"use client";

import {
  CircleIcon,
  StarIcon,
} from "@radix-ui/react-icons";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PaperCardProps = {
  description: string;
  title: string;
  timeAgoCalculation: string;
  highlightCount: number;
  isHighlighted: boolean;
  category?: string;
  onClick: () => void;
  onDoubleClick: () => void;
};

export function PaperCard({
  description,
  title,
  timeAgoCalculation,
  highlightCount,
  isHighlighted,
  category,
  onClick,
  onDoubleClick,
}: PaperCardProps) {
  return (
    <Card
      className={`flex flex-col min-h-[300px] ${isHighlighted ? "outline outline-2 outline-primary" : ""
        } group group-hover:cursor-pointer`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <CardHeader className="grid grid-cols-[1fr_auto] items-start gap-4 space-y-0 relative flex-shrink-0 group-hover:cursor-pointer">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow py-4 group-hover:cursor-pointer">
        <p className="line-clamp-4">{description}</p>
      </CardContent>
      <div className="flex space-x-4 text-sm text-muted-foreground px-4 pb-4 group-hover:cursor-pointer">
        <div className="flex items-center">
          <CircleIcon className="mr-1 h-3 w-3 fill-sky-400 text-sky-400" />
          {category}
        </div>
        <div className="flex items-center">
          <StarIcon className="mr-1 h-3 w-3" />
          {highlightCount}
        </div>
        <div>Updated {timeAgoCalculation}</div>
      </div>
    </Card>
  );
}
