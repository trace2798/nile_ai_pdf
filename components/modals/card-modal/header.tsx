"use client";

import { toast } from "sonner";
import { ElementRef, useRef, useState } from "react";
import { Layout } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/update-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FormInput } from "@/components/form/form-input";

interface CardWithListAndTitle extends CardWithList {
  listTitle: string;
}

interface HeaderProps {
  data: CardWithListAndTitle;
}

export const Header = ({ data }: HeaderProps) => {
  const queryClient = useQueryClient();
  const params = useParams();

  const { execute } = useAction(updateCard, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["card", data[0].id],
      });

      queryClient.invalidateQueries({
        queryKey: ["card-logs", data[0].id],
      });

      toast.success(`Renamed to "${data[0].title}"`);
      setTitle(data[0].title);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const inputRef = useRef<ElementRef<"input">>(null);

  const [title, setTitle] = useState(data.title);

  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  const onSubmit = (formData: FormData) => {
    console.log(formData);
    const title = formData.get("title") as string;
    const boardId = params.boardId as string;
    const tenant_id = formData.get("tenant_id") as string;
    if (title === data.title) {
      return;
    }

    execute({
      title,
      boardId,
      id: data.id,
      list_id: data.list_id,
      tenant_id,
    });
  };
  console.log(data);
  return (
    <div className="flex items-start gap-x-3 mb-3 w-full">
      <Layout className="h-5 w-5 mt-1 text-muted-foreground" />
      <div className="w-full">
        <form action={onSubmit}>
          <FormInput
            ref={inputRef}
            onBlur={onBlur}
            id="title"
            defaultValue={title}
            className="font-semibold dark:text-neutral-200 text-xl px-1 text-neutral-700 bg-transparent border-transparent relative -left-1.5 w-[95%] focus-visible:bg-inherit focus-visible:border-input mb-0.5 truncate"
          />
             <input
              hidden
              id="tenant_id"
              name="tenant_id"
              value={data.tenant_id}
            />
            <input hidden id="list_id" name="list_id" value={data.list_id} />
           
        </form>
        <p className="text-sm text-muted-foreground">
          in list <span className="underline">{data.listTitle}</span>
        </p>
      </div>
    </div>
  );
};

Header.Skeleton = function HeaderSkeleton() {
  return (
    <div className="flex items-start gap-x-3 mb-6">
      <Skeleton className="h-6 w-6 mt-1 bg-neutral-200" />
      <div>
        <Skeleton className="w-24 h-6 mb-1 bg-neutral-200" />
        <Skeleton className="w-12 h-4 bg-neutral-200" />
      </div>
    </div>
  );
};
