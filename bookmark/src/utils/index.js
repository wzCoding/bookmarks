function debounce(func, delay = 1000) {
    let timer = null
    return function () {
        const that = this
        const args = arguments

        if (timer) {
            clearTimeout(timer) //清除已有的计时器，重新开始计时
        }

        timer = setTimeout(() => {
            func.apply(that, args)
        }, delay)
    }
}
export {
    debounce
}