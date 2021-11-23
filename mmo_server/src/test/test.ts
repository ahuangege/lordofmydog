class CD {
    constructor() {
        console.log(111, (this as any).constructor.name)

    }
}

class Ab extends CD {
    constructor() {
        super()
        console.log(222, (this as any).constructor.name)
    }
}

console.log(Ab.name)
let tmp = new Ab();

console.log(333, (tmp as any).constructor.name)