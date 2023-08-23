import Cell from './cell.js';
export default class WebSocketClient {

    constructor(renderer) {
        this.socket = null;
        this.isConnected = false;
        this.renderer = renderer;
    }

    async connect(url) {
        try {
            await new Promise((resolve, reject) => {
                this.socket = new WebSocket(url);
                this.socket.binaryType = 'arraybuffer';
                this.socket.addEventListener('open', () => {
                    console.log('Connection open');
                    this.isConnected = true;
                    this.renderer.isDrawStars = false;
                    resolve();
                });

                this.socket.addEventListener('error', (event) => {
                    console.error('WebSocket error: ', event);
                    this.renderer.isDrawStars = true;
                    reject(new Error('WebSocket error'));
                });

                this.socket.addEventListener('message', (event) => {
                    // 获取原始的ArrayBuffer数据
                    var rawData = event.data;

                    // 使用MessagePack的decode函数进行反序列化
                    var decodedData = MessagePack.decode(rawData);

                    // // 转换为对象
                    // var circles = decodedData.map(ArrayToCell);

                    // // 转换为对象
                    // circles.forEach(circle => {
                    //     console.log(`X: ${circle.X}, Y: ${circle.Y}, Radius: ${circle.Radius}`);
                    // });
                });

                this.socket.addEventListener('close', (event) => {
                    this.renderer.isDrawStars = true;
                    console.log('Connection closed');
                    this.isConnected = false;
                    if (event.wasClean) {
                        resolve();
                    } else {
                        reject(new Error('WebSocket error: Connection closed unexpectedly'));
                    }
                });
            });
        } catch (error) {
            this.isConnected = false;
            console.error('Failed to connect: ', error);
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        }
    }

    close() {
        return new Promise((resolve, reject) => {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                reject(new Error('Socket is not open'));
                return;
            }

            this.socket.addEventListener('close', (event) => {
                console.log('Connection closed');
                this.isConnected = false;
                resolve();
            });

            this.socket.addEventListener('error', (event) => {
                console.error('WebSocket error: ', event);
                reject(new Error('WebSocket error'));
            });

            this.socket.close();
        });
    }

    getState() {
        if (!this.socket) {
            return 'UNINITIALIZED';
        }

        switch (this.socket.readyState) {
            case WebSocket.CONNECTING:
                return 'CONNECTING';
            case WebSocket.OPEN:
                return 'OPEN';
            case WebSocket.CLOSING:
                return 'CLOSING';
            case WebSocket.CLOSED:
                return 'CLOSED';
            default:
                return 'UNKNOWN';
        }
    }
}
function ArrayToCell(array){
    return new Cell(array[0], array[1], array[2]);
}