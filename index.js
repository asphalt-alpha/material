const escpos = require('escpos');
const QRCode = require('qrcode');
const io = require('socket.io')(3000);

escpos.SerialPort = require('escpos-serialport');

io.on('connect', s => {
    console.log('connected.')

    s.on('print', (data) => {
        const device = new escpos.SerialPort('/dev/serial0', {
            baudRate: 9600
        });
        
        const printer = new escpos.Printer(device);

        console.log(`recieved.`, data);
        QRCode.toFile('qrcode.png', data.url, {
            width: 300,
        }, (err) => {
            if (err){
                s.emit('res',`400:${data}`);
                throw err
            }
            escpos.Image.load('qrcode.png', (image) => {
                device.open(() => {
                    printer
                        .font('b')
                        .align('ct')
                        .size(2, 1)
                        .image(image, 'd24')
                        .then(() => {
                            printer.cut()
                                   .close()
                            console.log('printing...');
                            s.emit('res',`200:${data}`);
                        });
                });
            });
        });
    });
});
