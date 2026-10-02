"use client";

import React, { useState, useEffect } from "react";
import { Bell, Send, Mail, AlertTriangle, Info, Clock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NotificationLog } from "@/store/greenCityStore";
import { notificationService } from "@/services/notification.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

interface NotificationFormData {
  recipientType: "All" | "Residents" | "Drivers";
  type: "Broadcast" | "Reminder" | "Emergency";
  title: string;
  message: string;
}

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    defaultValues: {
      recipientType: "All",
      type: "Broadcast",
      title: "",
      message: "",
    },
  });

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getAll();
      setLogs(data);
    } catch {
      toast.error("Failed to load notification logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const onSubmit = async (data: NotificationFormData) => {
    try {
      await notificationService.send(data);
      toast.success("Broadcast message sent successfully!");
      reset();
      loadLogs();
    } catch {
      toast.error("Failed to dispatch broadcast.");
    }
  };

  const getUrgencyIcon = (type: NotificationLog["type"]) => {
    switch (type) {
      case "Emergency":
        return <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 animate-bounce" />;
      case "Reminder":
        return <Clock className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-4.5 w-4.5 text-blue-500 shrink-0" />;
    }
  };

  return (
  <div className="flex flex-col gap-8 pb-8">

    {/* Page Header */}
    <div>
      <h2 className="text-3xl font-black tracking-tight text-foreground">
        Notifications & Alerts
      </h2>

      <p className="mt-2 max-w-3xl text-sm text-muted-text leading-relaxed">
        Send announcements, collection reminders and emergency alerts to
        residents and drivers across the Green City Smart Waste Collection
        System.
      </p>
    </div>

    <Card className="rounded-3xl border border-card-border bg-white shadow-sm">
      <CardHeader className="px-8 pt-8 pb-6 border-b border-card-border">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-green/10">
            <Send className="h-5 w-5 text-primary-green" />
          </div>

          <div>
            <CardTitle className="text-xl font-extrabold">
              Dispatch Broadcast
            </CardTitle>

            <CardDescription className="mt-1 text-sm">
              Send notifications instantly to residents and drivers.
            </CardDescription>
          </div>

        </div>

      </CardHeader>

      <CardContent className="px-8 py-8">

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-7"
        >

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Select
              label="Recipient Group *"
              options={[
                { value: "All", label: "All Council Users" },
                { value: "Residents", label: "Residents Only" },
                { value: "Drivers", label: "Drivers Only" },
              ]}
              {...register("recipientType")}
            />

            <Select
              label="Notification Type *"
              options={[
                {
                  value: "Broadcast",
                  label: "Standard Broadcast",
                },
                {
                  value: "Reminder",
                  label: "Collection Reminder",
                },
                {
                  value: "Emergency",
                  label: "Emergency Alert",
                },
              ]}
              {...register("type")}
            />

          </div>

          <Input
            label="Notification Title *"
            placeholder="Example: Waste collection schedule updated for Ward 03"
            error={errors.title?.message}
            {...register("title", {
              required: "Title is required.",
            })}
          />

          <div>

            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-text">
              Message Content *
            </label>

            <textarea
              rows={8}
              placeholder="Type your notification here..."
             className="
w-full
rounded-2xl
border
border-card-border
bg-card-bg
px-5
py-4
text-sm
text-foreground
placeholder:text-muted-text/60
outline-none
transition-all
duration-300
focus:border-primary-green
focus:ring-4
focus:ring-primary-green/10
resize-none
"
              {...register("message", {
                required: "Message body is required.",
              })}
            />

            {errors.message && (
              <span className="mt-2 block text-xs font-semibold text-red-500">
                {errors.message.message}
              </span>
            )}

          </div>

          <div className="flex justify-end pt-2">

            <Button
              type="submit"
              variant="primary"
              className="
                h-12
                rounded-xl
                px-8
                text-sm
                font-semibold
                shadow-md
                hover:shadow-lg
                transition-all
                duration-300
                cursor-pointer
              "
            >
              <Send className="mr-2 h-4 w-4" />
              Send Notification
            </Button>

          </div>

        </form>

      </CardContent>
    </Card>

  </div>
);
}
