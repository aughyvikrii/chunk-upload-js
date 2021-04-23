class SplitUpload {

    createFileURL = null;
    uploadChunkURL = null;

    file = null;

    // 1 Mb = 1000000
    chunkSize = 1000000;
    numberOfChunks = 0;
    originFileName = null;
    ext = null;
    newFileName = null;

    constructor(args) {
        if(args?.createFileURL) this.setCreateFileURL(args.createFileURL);
        if(args?.uploadChunkURL) this.setUploadChunkURL(args.uploadChunkURL);
    }

    setCreateFileURL(url) {
        this.createFileURL = url;
    }

    setUploadChunkURL(url) {
        this.uploadChunkURL = url;
    }

    createFile() {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            const form = new FormData();
            form.append('ext', this.ext);
    
            request.open('POST', this.createFileURL, true);

            request.onload = (event) => {
    
                const response = JSON.parse(request.response);
                if(response?.status !== 'ok') return reject(false);
                this.newFileName = response.data.name;
                return resolve(response.data.name);
            }
            
            request.onerror = () => {
                reject(false);
            };    

            request.send(form);
        });
    }

    uploadChunk(form) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            request.open('POST', this.uploadChunkURL, true);

            request.onload = (event) => {
                const response = JSON.parse(request.response);
                if(response?.status !== 'ok') return reject(false);
                return resolve(true);
            }
            
            request.onerror = () => {
                reject(false);
            };    

            request.send(form);
        });
    }

    chunkEncode(chunk) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = (event) => {
                if(event.target.readyState !== FileReader.DONE);
                resolve(event.target.result);
            }

            reader.readAsDataURL(chunk);
        });
    }

    async upload(file) {
        this.file = file;

        this.originFileName = this.file.name;
        this.ext = this.originFileName.split('.').pop();

        await this.createFile();

        this.numberOfChunks = Math.ceil(this.file.size / this.chunkSize);
        let start = 0;

        for(let i=0; i < this.numberOfChunks; i++) {
            console.log('Mulai upload chunk ke:', i);

            let chunkEnd = Math.min(start + this.chunkSize, this.file.size);

            const chunk = this.file.slice(start, chunkEnd);
            const chunkEncode = await this.chunkEncode(chunk);
            const chunkForm = new FormData();

            chunkForm.append('data', chunkEncode);
            chunkForm.append('file', this.newFileName);
            
            console.log('form:', chunkForm);
            const result = await this.uploadChunk(chunkForm);
            console.log('Upload Chunk: ', result);

            start += this.chunkSize;
        }

        return 'ok';
    }
}