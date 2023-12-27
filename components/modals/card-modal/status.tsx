"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LayoutList } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { updateCard } from "@/actions/update-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/use-action";
import { CardWithList } from "@/types";

interface StatusProps {
  data: CardWithList;
}

export const Status = ({ data }: StatusProps) => {
  const params = useParams();
  const queryClient = useQueryClient();

  const { execute } = useAction(updateCard, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["card", data[0].id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", data[0].id],
      });
      toast.success(`Card "${data[0].title}" updated`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  console.log(data);
  const onSubmit = (status: string) => {
    const boardId = params.boardId as string;
    const tenant_id = data.tenant_id;
    const list_id = data.list_id;
    execute({
      id: data.id,
      boardId,
      tenant_id,
      list_id,
      status,
    });
  };

  const statusOptions = ["to-do", "in-progress", "done", "non-applicable"];

  return (
    <div className="flex items-center gap-x-3 w-full">
      <LayoutList className="h-5 w-5 mt-0.5 text-muted-foreground" />
      <div className="w-full flex items-center gap-x-2">
        <p className="font-semibold text-muted-foreground">Status</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="capitalize">
              {data.status || "Update Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statusOptions.map((status, index) => (
              <DropdownMenuItem
                key={index}
                className="capitalize"
                onClick={() => onSubmit(status)}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

Status.Skeleton = function StatusSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full flex items-center gap-x-2">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
      </div>
    </div>
  );
};
