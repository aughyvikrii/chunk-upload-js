class SplitUpload {

    createFileURL = null;
    uploadChunkURL = null;

    file = null;

    // 1 Mb = 1000000
    chunkSize = 1000000;
    numberOfChunk = 0;
    chunkCounter= 0;
    originFileName = null;
    ext = null;
    newFileName = null;

    // Callback
    cbFileSize = null;
    cbFilePart = null;
    cbPartUpload = null;
    cbPartUploadPercent = null;
    cbTotalUpload = null;
    cbStatus = null;

    constructor(args) {
        if(args?.createFileURL) this.setCreateFileURL(args.createFileURL);
        if(args?.uploadChunkURL) this.setUploadChunkURL(args.uploadChunkURL);

        if(args?.cbFileSize) this.cbFileSize = args.cbFileSize;
        if(args?.cbFilePart) this.cbFilePart = args.cbFilePart;
        if(args?.cbPartUpload) this.cbPartUpload = args.cbPartUpload;
        if(args?.cbPartUploadPercent) this.cbPartUploadPercent = args.cbPartUploadPercent;
        if(args?.cbTotalUpload) this.cbTotalUpload = args.cbTotalUpload;
        if(args?.cbStatus) this.cbStatus = args.cbStatus;
        if(args?.chunkSize) this.chunkSize = args.chunkSize;
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
                this.updateStatus('Gagal membuat file!')
                reject(false);
            };    

            request.send(form);
        });
    }

    uploadChunk(form) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            const updateProgress = (oEvent) => {
                if(oEvent.lengthComputable) {
                    let percentComplete = Math.round(oEvent.loaded / oEvent.total * 100);
                    
                    let totalPercentComplete = Math.round((this.chunkCounter -1)/this.numberOfChunk*100 + percentComplete/this.numberOfChunk);
                    if(this.cbPartUploadPercent) this.cbPartUploadPercent(percentComplete);
                    if(this.cbTotalUpload) this.cbTotalUpload(totalPercentComplete);
                }
            }

            request.upload.addEventListener('progress', updateProgress);

            request.open('POST', this.uploadChunkURL, true);

            request.onload = (event) => {
                const response = JSON.parse(request.response);
                if(response?.status !== 'ok') {
                    this.updateStatus('Gagal upload bagian!')
                    return reject(false);
                }
                return resolve(true);
            }
            
            request.onerror = () => {
                this.updateStatus('Gagal mengupload bagian!')
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

    updateStatus(status) {
        if(this.cbStatus) this.cbStatus(status);
    }

    async upload(file) {
        this.file = file;

        this.originFileName = this.file.name;
        this.ext = this.originFileName.split('.').pop();
        if(this.cbFileSize) this.cbFileSize(this.file.size);
        
        this.updateStatus('Membuat file...');
        await this.createFile();

        this.numberOfChunk = Math.ceil(this.file.size / this.chunkSize);

        if(this.cbFilePart) this.cbFilePart(this.numberOfChunk);

        let start = 0;

        this.updateStatus('Mengupload bagian...');

        for(let i=0; i < this.numberOfChunk; i++) {
            this.chunkCounter++;
            if(this.cbPartUpload) this.cbPartUpload(i+1);
            let chunkEnd = Math.min(start + this.chunkSize, this.file.size);

            const chunk = this.file.slice(start, chunkEnd);
            const chunkEncode = await this.chunkEncode(chunk);
            const chunkForm = new FormData();

            chunkForm.append('data', chunkEncode);
            chunkForm.append('file', this.newFileName);
            
            await this.uploadChunk(chunkForm);

            start += this.chunkSize;
        }

        this.updateStatus('Berhasil mengupload!');

        return this.newFileName;
    }
}