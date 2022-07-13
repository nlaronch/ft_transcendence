// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { Server } from "socket.io";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

async function createServer() {

  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();

  io.on("connection", (socket) => {
    socket.emit("noArg");
    socket.emit("basicEmit", 1, "2", Buffer.from([3]));
    socket.emit("withAck", "4", (e) => {
      // e is inferred as number
    });
  
    // works when broadcast to all
    io.emit("noArg");
  
    // works when broadcasting to a room
    io.to("room1").emit("basicEmit", 1, "2", Buffer.from([3]));
  });
  
  io.on("connection", (socket) => {
    socket.on("hello", () => {
      // ...
    });
  });
  
  io.serverSideEmit("ping");
  
  io.on("ping", () => {
    // ...
  });
  
  io.on("connection", (socket) => {
    socket.data.name = "john";
    socket.data.age = 42;
  });


  io.listen(3000);
}