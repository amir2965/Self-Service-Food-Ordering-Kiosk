function scrollToProductView() {
    const productView = document.getElementById('product-view');
    if (productView) {
        productView.scrollIntoView({ behavior: 'smooth' });
    }
}
