<script>
    document.addEventListener("DOMContentLoaded", function() {
    const firinBanners = document.querySelectorAll('.firin-banner');
    const secinBanners = document.querySelectorAll('.secin-banner');
    let firinIndex = 0;
    let secinIndex = 0;

    function showNextBanner(banners, index) {
    banners.forEach((banner, i) => {
    banner.style.opacity = i === index ? '1' : '0';
});
}

    function startCarousel() {
    showNextBanner(firinBanners, firinIndex);
    showNextBanner(secinBanners, secinIndex);

    firinIndex = (firinIndex + 1) % firinBanners.length;
    secinIndex = (secinIndex + 1) % secinBanners.length;
}

    setInterval(startCarousel, 3000);
});
</script>
