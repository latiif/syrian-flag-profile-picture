document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('fileInput');
    const ringWidthSlider = document.getElementById('ringWidth');
    const starRotationSlider = document.getElementById('starRotation');
    const downloadBtn = document.getElementById('downloadBtn');
    let currentImage = null;
    let imageX = 0;
    let imageY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    function drawStar(ctx, x, y, size, color) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 2); // Adjust base orientation to point up

        for (let i = 0; i < 5; i++) {
            ctx.lineTo(size * Math.cos(i * 2 * Math.PI / 5),
                size * Math.sin(i * 2 * Math.PI / 5));
            ctx.lineTo(size / 2 * Math.cos((i * 2 + 1) * Math.PI / 5),
                size / 2 * Math.sin((i * 2 + 1) * Math.PI / 5));
        }

        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    function drawRings(image, ringWidth, starRotation) {
        if (!image) return;

        // Clear canvas and set dimensions
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Calculate safe radius with padding
        const padding = 0;
        const maxRadius = (Math.min(canvas.width, canvas.height) / 2) - padding;

        // Calculate ring dimensions with safety margin
        const safeRingWidth = Math.min(ringWidth, maxRadius / 2);
        const outerRadius = maxRadius - safeRingWidth;
        const middleRadius = outerRadius - safeRingWidth;
        const innerRadius = middleRadius - safeRingWidth;

        // Draw image
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(image, imageX, imageY, 400, 400);
        ctx.restore();

        // Draw rings
        ctx.lineWidth = safeRingWidth;

        [
            { radius: outerRadius, color: 'green' },
            { radius: middleRadius, color: 'white' },
            { radius: innerRadius, color: 'black' }
        ].forEach(ring => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = ring.color;
            ctx.stroke();
        });

        // Draw stars on middle ring
        const starSize = safeRingWidth * 0.5; // Star size proportional to ring width
        const starRadius = middleRadius; // Place stars on middle ring
        const baseAngle = (Math.PI / 6) - (starRotation * Math.PI) / 180; // Convert degrees to radians

        const starCount = 3;
        const starColor = 'red';

        for (let i = 0; i < starCount; i++) {
            const angle = baseAngle + (i * (360 / starCount)) * (Math.PI / 180);
            const x = centerX + starRadius * Math.cos(angle);
            const y = centerY + starRadius * Math.sin(angle);
            drawStar(ctx, x, y, starSize, starColor);
        }
    }

    // Event listeners
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                currentImage = img;
                imageX = (canvas.width - 400) / 2;
                imageY = (canvas.height - 400) / 2;
                drawRings(currentImage, ringWidthSlider.value, starRotationSlider.value);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    ringWidthSlider.addEventListener('input', function () {
        drawRings(currentImage, this.value, starRotationSlider.value);
    });

    starRotationSlider.addEventListener('input', function () {
        drawRings(currentImage, ringWidthSlider.value, this.value);
    });

    downloadBtn.addEventListener('click', function () {
        const link = document.createElement('a');
        link.download = 'profile-image.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Drag and drop functionality for mouse
    canvas.addEventListener('mousedown', function (e) {
        isDragging = true;
        dragStartX = e.clientX - imageX;
        dragStartY = e.clientY - imageY;
    });

    canvas.addEventListener('mousemove', function (e) {
        if (isDragging) {
            imageX = e.clientX - dragStartX;
            imageY = e.clientY - dragStartY;
            drawRings(currentImage, ringWidthSlider.value, starRotationSlider.value);
        }
    });

    canvas.addEventListener('mouseup', function () {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', function () {
        isDragging = false;
    });

    // Drag and drop functionality for touch
    canvas.addEventListener('touchstart', function (e) {
        isDragging = true;
        const touch = e.touches[0];
        dragStartX = touch.clientX - imageX;
        dragStartY = touch.clientY - imageY;
    });

    canvas.addEventListener('touchmove', function (e) {
        if (isDragging) {
            const touch = e.touches[0];
            imageX = touch.clientX - dragStartX;
            imageY = touch.clientY - dragStartY;
            drawRings(currentImage, ringWidthSlider.value, starRotationSlider.value);
        }
    });

    canvas.addEventListener('touchend', function () {
        isDragging = false;
    });

    canvas.addEventListener('touchcancel', function () {
        isDragging = false;
    });
});