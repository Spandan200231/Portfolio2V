import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Mail, MailOpen, Trash2, Download, Eye } from "lucide-react";
import type { ContactMessage } from "@shared/schema";

export default function ViewMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/messages"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/admin/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/messages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openMessageDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
    
    // Mark as read if not already read
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Contact Messages</h1>
              <p className="text-sm text-gray-600">
                {unreadCount} unread of {messages.length} total messages
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !message.read ? 'border-l-4 border-l-primary bg-blue-50/30' : ''
              }`}
              onClick={() => openMessageDialog(message)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      message.read ? 'bg-gray-100' : 'bg-primary/10'
                    }`}>
                      {message.read ? (
                        <MailOpen className={`h-4 w-4 text-gray-600`} />
                      ) : (
                        <Mail className={`h-4 w-4 text-primary`} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{message.name}</CardTitle>
                      <p className="text-sm text-gray-600">{message.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!message.read && (
                      <Badge variant="default" className="bg-primary">
                        New
                      </Badge>
                    )}
                    {message.attachmentUrl && (
                      <Badge variant="outline">
                        Has Attachment
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(message.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-2">
                  {message.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {messages.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-gray-600">
                Contact form submissions will appear here when visitors send messages.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Message Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Message from {selectedMessage.name}</span>
                    <div className="flex items-center space-x-2">
                      {selectedMessage.attachmentUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a 
                            href={selectedMessage.attachmentUrl} 
                            download={selectedMessage.attachmentName}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(selectedMessage.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">From:</label>
                      <p>{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Email:</label>
                      <p>{selectedMessage.email}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Date:</label>
                      <p>{new Date(selectedMessage.createdAt!).toLocaleString()}</p>
                    </div>
                    {selectedMessage.attachmentName && (
                      <div>
                        <label className="font-medium text-gray-700">Attachment:</label>
                        <p>{selectedMessage.attachmentName}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="font-medium text-gray-700 block mb-2">Message:</label>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      asChild
                    >
                      <a 
                        href={`mailto:${selectedMessage.email}?subject=Re: Your message&body=Hi ${selectedMessage.name},%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0ABest regards,%0D%0ASpandan Majumder`}
                      >
                        Reply via Email
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
