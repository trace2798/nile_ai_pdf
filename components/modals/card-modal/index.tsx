"use client";

import { useQuery } from "@tanstack/react-query";

import { CardWithList } from "@/types";
import { fetcher } from "@/lib/fetcher";
// import { AuditLog } from "@prisma/client";
import { useCardModal } from "@/hooks/use-card-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Header } from "./header";
import { Description } from "./description";
import { Actions } from "./actions";
import { Status } from "./status";
import { DueDate } from "./due-date";
import { AssignPerson } from "./assign-person";
import { Activity } from "./activity";
// import { Activity } from "./activity";

interface CardWithListAndTitle extends CardWithList {
  listTitle: string;
}

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);
  const users = useCardModal((state) => state.userInfo);
  const { data: cardData } = useQuery<CardWithListAndTitle>({
    queryKey: ["card", id],
    queryFn: () => fetcher(`/api/cards/${id}`),
    enabled: !!id,
  });

  const { data: auditLogsData } = useQuery<any[]>({
    queryKey: ["card-logs", id],
    queryFn: () => fetcher(`/api/cards/${id}/logs`),
    enabled: !!id,
  });
  console.log(cardData);
  console.log(users);
  console.log(auditLogsData)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {!cardData ? <Header.Skeleton /> : <Header data={cardData} />}
        {!cardData ? <Status.Skeleton /> : <Status data={cardData} />}
        {!cardData ? <DueDate.Skeleton /> : <DueDate data={cardData} />}
        {!cardData ? (
          <AssignPerson.Skeleton />
        ) : (
          <AssignPerson data={cardData} users={users} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {!cardData ? (
                <Description.Skeleton />
              ) : (
                <Description data={cardData} />
              )}
              {!auditLogsData
                ? <Activity.Skeleton />
                : <Activity items={auditLogsData} />
              }
            </div>
          </div>
          {!cardData ? <Actions.Skeleton /> : <Actions data={cardData} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
