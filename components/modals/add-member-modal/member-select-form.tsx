"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useState } from "react";
import { addMember } from "@/app/(platform)/dashboard/organization/[organizationId]/settings/_components/member-action";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  tenantId: z.string().min(2).max(50),
  user_id: z.string().min(2).max(256),
  email: z.string(),
  roles: z.string(),
});
const roles = ["owner", "guest", "admin", "member"];
const MemberSelectForm = ({
  tenantId,
  users,
}: {
  tenantId: string;
  users: any;
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: tenantId,
      email: "",
      user_id: "",
      roles: "guest",
    },
  });
  type FormData = z.infer<typeof formSchema>;

  const onSubmit: SubmitHandler<FormData> = async (values) => {
    try {
      setLoading(true);
      console.log(values, "VALUES VALUES");
      // await addMember(tenantId, values.email, values.user_id);
      // form.reset();
      // toast("Member Added");
      // router.refresh();
      const result = await addMember(
        tenantId,
        values.email,
        values.user_id,
        values.roles
      );
      if (result?.message === "User already exists in the organization") {
        toast("User already exists in the organization");
      } else {
        form.reset();
        toast("Member Added");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast("Error adding member");
    }
  };
  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select a User To Add</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? users.find((user: any) => user.id === field.value)
                            ?.email
                        : "Select User"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search user..." />
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((user: any) => (
                        <CommandItem
                          value={user.id}
                          key={user.id}
                          onSelect={() => {
                            form.setValue("user_id", user.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              user.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {user.email}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Once submitted the user will be added to this organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select a Role</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between capitalize",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? roles.find((role: string) => role === field.value)
                        : "Select Role"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search user..." />
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {roles.map((role: string, index) => (
                        <CommandItem
                          value={role}
                          key={index}
                          className="capitalize"
                          onSelect={() => {
                            form.setValue("roles", role);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              role === field.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {role}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Once submitted the user will be added to this organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default MemberSelectForm;
