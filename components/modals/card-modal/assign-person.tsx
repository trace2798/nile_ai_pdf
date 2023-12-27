"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, LayoutList } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface AssignPersonProps {
  data: CardWithList;
  users: any;
}

export const AssignPerson = ({ data, users }: AssignPersonProps) => {
  console.log(users);
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

  const onSubmit = (assign_id: string, assign_name: string) => {
    const boardId = params.boardId as string;
    const tenant_id = data.tenant_id;
    const list_id = data.list_id;
    execute({
      id: data.id,
      boardId,
      tenant_id,
      list_id,
      assign_id,
      assign_name,
    });
  };

  return (
    <div className="flex items-center gap-x-3 w-full">
      <LayoutList className="h-5 w-5 mt-0.5 text-muted-foreground" />
      <div className="w-full flex items-center gap-x-2">
        <p className="font-semibold text-muted-foreground">Assign To:</p>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" className="capitalize">
              {data.assign_name || "Select Assignee"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {users.map((user: any, index: any) => (
              <DropdownMenuItem
                key={index}
                className="capitalize"
                onClick={() => onSubmit(user.id, user.name)}
              >
                {user.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="capitalize">
              {data.assign_name || "Select Assignee"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <Command>
              <CommandInput placeholder="Search user..." />
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {users.map((user: any) => (
                  <CommandItem
                    value={user.id}
                    key={user.id}
                    onSelect={() => onSubmit(user.id, user.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        user.id === data.assign_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {user.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

AssignPerson.Skeleton = function StatusSkeleton() {
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
