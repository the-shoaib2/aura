import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { TextOperation } from 'ot';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@aura/design-system';
import { Users, History } from 'lucide-react';

export function WorkflowEditor({ workflowId, userName }: { workflowId: string; userName: string }) {
  const [content, setContent] = useState('');
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const operationsRef = useRef<TextOperation[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3005');
    setSocket(newSocket);

    newSocket.emit('join_workflow', workflowId, userName);

    newSocket.on('workflow_state', (initialContent: string) => {
      setContent(initialContent);
    });

    newSocket.on('workflow_operation', (operationJson: any) => {
      const operation = TextOperation.fromJSON(operationJson);
      
      // Apply incoming operation
      setContent(prev => {
        const newContent = operation.apply(prev);
        operationsRef.current.push(operation);
        return newContent;
      });
    });

    newSocket.on('presence_update', (usersList: { id: string; name: string }[]) => {
      setUsers(usersList);
    });

    newSocket.on('workflow_history', (historyList: string[]) => {
      setHistory(historyList);
    });

    newSocket.on('workflow_restore', (content: string) => {
      setContent(content);
    });

    // Request history on mount
    newSocket.emit('request_history', workflowId);

    return () => {
      newSocket.disconnect();
    };
  }, [workflowId, userName]);

  const handleChange = (newContent: string) => {
    // Calculate changes using simple diff algorithm
    const oldContent = content;
    // Create operation by comparing old and new content
    // The ot library doesn't have a diff method, so we need to compute it manually
    // For now, use a simple approach: create a replace operation
    const operation = new TextOperation();
    if (oldContent !== newContent) {
      // Simple approach: delete all and insert new
      operation.retain(0);
      operation.delete(oldContent.length);
      operation.insert(newContent);
    }
    
    // Transform against pending operations sequentially
    let transformedOp = operation;
    for (const pendingOp of operationsRef.current) {
      const [op1]: [TextOperation] = TextOperation.transform(transformedOp, pendingOp) as unknown as [TextOperation];
      transformedOp = op1;
    }
    
    // Apply locally
    setContent(transformedOp.apply(oldContent));
    operationsRef.current.push(transformedOp);
    
    // Send to server
    socket.emit('workflow_operation', workflowId, transformedOp.toJSON());
  };

  const restoreVersion = (index: number) => {
    socket.emit('restore_version', workflowId, index);
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Collaborators:</span>
        {users.length > 0 ? (
          users.map(user => (
            <Badge key={user.id} variant="secondary">
              {user.name}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No other users</span>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Workflow Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea 
              value={content} 
              onChange={(e) => handleChange(e.target.value)} 
              placeholder="Edit workflow..." 
              className="w-full h-96 p-4 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <ul className="space-y-2">
                {history.map((_, index) => (
                  <li key={index}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => restoreVersion(index)}
                    >
                      Version {index + 1}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No history available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
