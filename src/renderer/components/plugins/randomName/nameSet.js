export default  {
    data: function() {
        return {}
    },
    props: ["renderObj"],
    render: function(r) {
        return r("div", {
            class: this.renderObj.class
        }, this.renderObj.list.map(function(n) {
            function t(n, e) {
                let i;
                return i = n && Array.isArray(n) ? n.map(function(n) {
                    let e = function(r) {
                            return r ? Object.assign({}, r) : {}
                        }(n.props),
                        i = t(n.child, n.text);
                    return r(n.tag, e, i)
                }) : e || ""
            }
            if (!n || !Array.isArray(n)) return;
            let e = t(n);
            return r("div", {
                class: "item"
            }, e)
        }))
    },
    methods: {
        xing: function(r) {
            console.log(nameData[r])
        }
    }
};