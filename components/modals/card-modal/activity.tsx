"use client";

// import { AuditLog } from "@prisma/client";
import { ActivityIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
// import { ActivityItem } from "@/components/activity-item";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import {
  CardTitle,
  CardDescription,
  CardContent,
  Card,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";

interface ActivityProps {
  items: any[];
}

export const Activity = ({
  items,
}: //   items,
ActivityProps) => {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <ActivityIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
      <div className="w-full">
        <p className="font-semibold text-muted-foreground mb-2">Activity</p>
        <ol className="mt-2 space-y-4">
          {items.map((item, index) => (
            // <ActivityItem
            //   key={item.id}
            //   data={item}
            // />
            <Card key={index} className="border rounded-lg max-w-sm mx-auto shadow-sm overflow-hidden">
              <CardContent className="flex items-center space-x-4 p-2">
                <Avatar className="relative overflow-visible">
                  {/* <span className="absolute right-0 top-0 flex h-3 w-3 rounded-full bg-green-600" /> */}
                  <div className="overflow-hidden rounded-full">
                    <AvatarImage alt="@jaredpalmer" src={item.user_picture} />
                    <AvatarFallback>{}</AvatarFallback>
                  </div>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    {/* <CardTitle className="text-lg font-semibold capitalize">
                      {item.user_name}
                    </CardTitle> */}
                    {/* <CardDescription className="text-sm text-gray-500">
                      {format(new Date(item.changed_at), "MMM d, yyyy h:mm a")}
                    </CardDescription> */}
                  </div>
                  <p className="text-sm mt-2 capitalize">{item.message}</p>
                </div>
              </CardContent>
              <CardFooter className="pb-2 text-sm text-muted-foreground">
                {format(new Date(item.changed_at), "MMM d, yyyy h:mm a")}
              </CardFooter>
            </Card>
          ))}
        </ol>
      </div>
    </div>
  );
};

Activity.Skeleton = function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-10 bg-neutral-200" />
      </div>
    </div>
  );
};
