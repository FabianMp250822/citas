import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

const PinnedMessages = ({ pinnedMessages, handleUnpinMessage }) => {
  return (
    <>
      {pinnedMessages.length > 0 && (
        <div>
          {pinnedMessages.map((msg, i) => (
            <div key={i} className="flex justify-center items-center gap-1">
              <p className="text-center text-xs text-default-700 mb-1">
                Usted {msg?.isPinned ? "ha desfijado" : "ha fijado"} un mensaje.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <span className="text-xs font-medium text-primary cursor-pointer inline-block mb-1 hover:underline">
                    Ver todos
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-center mt-2">
                      Mensajes fijados
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="max-h-[400px]">
                    <ScrollArea className="h-full">
                      {pinnedMessages.map((pinnedMessage, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 border-b last:border-none border-default-100 py-4"
                        >
                          <div className="h-10 w-10 self-end">
                            <Image
                              src={pinnedMessage.avatar}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          <span className="flex-1">{pinnedMessage.note}</span>
                          <Badge
                            color="primary"
                            variant="outline"
                            className="px-4 h-7 cursor-pointer self-end"
                            onClick={() => handleUnpinMessage(pinnedMessage)}
                          >
                            Desfijar
                          </Badge>
                        </div>
                      ))}
                    </ScrollArea>
                  </DialogDescription>
                  <DialogFooter className="sm:justify-center">
                    <DialogClose asChild>
                      <Button className="rounded-full">Cerrar</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PinnedMessages;
