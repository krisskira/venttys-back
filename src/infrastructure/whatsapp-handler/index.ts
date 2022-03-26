import { iLogger, iPubSub } from "../../infrastructure/interfaces";
// import venom from "venom-bot";

export class WhatsAppHandler {
  //   constructor(logger: iLogger, pubSub: iPubSub) {
  //     throw "No implement yet";
  //   }

  async doOrder(): Promise<void> {
    throw "No implement yet";
  }

  async getOrderStatus(): Promise<void> {
    throw "No implement yet";
  }

  async responseToUser(option: string): Promise<void> {
    throw "No implement yet";
  }
}

// venom
//   .create(
//     "sessionName",
//     (base64Qr, asciiQR, attempts, urlCode) => {
//       console.log(asciiQR); // Optional to log the QR in the terminal
//       const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
//         response = {};

//       if (matches.length !== 3) {
//         return new Error("Invalid input string");
//       }
//       response.type = matches[1];
//       response.data = new Buffer.from(matches[2], "base64");

//       const imageBuffer = response;
//       require("fs").writeFile(
//         "out.png",
//         imageBuffer["data"],
//         "binary",
//         function (err) {
//           if (err != null) {
//             console.log(err);
//           }
//         }
//       );
//     },
//     undefined,
//     { logQR: false }
//   )
//   .then((client) => start(client))
//   .catch((erro) => {
//     console.log(erro);
//   });

// function start(client) {
//   client.onMessage((message) => {
//     if (message.body === "Hi" && message.isGroupMsg === false) {
//       client
//         .sendText(message.from, "Welcome Venom 🕷")
//         .then((result) => {
//           console.log("Result: ", result); //return object success
//         })
//         .catch((erro) => {
//           console.error("Error when sending: ", erro); //return object error
//         });
//     }
//   });
// }
