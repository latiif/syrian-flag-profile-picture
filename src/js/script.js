document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('fileInput');
    const ringWidthSlider = document.getElementById('ringWidth');
    const starRotationSlider = document.getElementById('starRotation');
    const colorSchemeSwitch = document.getElementById('colorScheme');
    const downloadBtn = document.getElementById('downloadBtn');
    let currentImage = null;

    function drawStar(ctx, x, y, size, color) {
        ctx.beginPath();
        ctx.save();
        ctx.translate(x, y);
        
        // Draw 5-pointed star
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size,
                       Math.sin((18 + i * 72) * Math.PI / 180) * size);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (size/2),
                       Math.sin((54 + i * 72) * Math.PI / 180) * (size/2));
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    function drawRings(img, ringWidth, starRotation) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image if exists
        if (img) {
            const scale = Math.min(200 / img.width, 200 / img.height);
            const width = img.width * scale;
            const height = img.height * scale;
            ctx.drawImage(img, 
                (canvas.width - width) / 2,
                (canvas.height - height) / 2,
                width, height);
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Calculate radii (outer ring starts at 140)
        const outerRadius = 140;
        const middleRadius = outerRadius - ringWidth;
        const innerRadius = middleRadius - ringWidth;
        
        // Determine ring colors based on switch
        const outerColor = colorSchemeSwitch.checked ? 'green' : 'red';
        const middleColor = 'white';
        const innerColor = 'black';
        
        // Draw rings from outer to inner
        ctx.lineWidth = ringWidth;

        // Outer ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = outerColor;
        ctx.stroke();

        // Middle ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, middleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = middleColor;
        ctx.stroke();

        // Draw stars on middle ring
        const starSize = ringWidth * 0.5; // Star size proportional to ring width
        const starRadius = middleRadius; // Place stars on middle ring
        const baseAngle = (starRotation * Math.PI) / 180; // Convert degrees to radians

        const starCount = colorSchemeSwitch.checked ? 3 : 2;
        const starColor = colorSchemeSwitch.checked ? 'red' : 'green';

        for (let i = 0; i < starCount; i++) {
            const angle = baseAngle + (i * (360 / starCount)) * Math.PI / 180;
            const starX = centerX + starRadius * Math.cos(angle);
            const starY = centerY + starRadius * Math.sin(angle);
            drawStar(ctx, starX, starY, starSize, starColor);
        }

        // Inner ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = innerColor;
        ctx.stroke();
    }

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                currentImage = img;
                drawRings(currentImage, ringWidthSlider.value, starRotationSlider.value);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    ringWidthSlider.addEventListener('input', function() {
        drawRings(currentImage, this.value, starRotationSlider.value);
    });

    starRotationSlider.addEventListener('input', function() {
        drawRings(currentImage, ringWidthSlider.value, this.value);
    });

    colorSchemeSwitch.addEventListener('change', function() {
        drawRings(currentImage, ringWidthSlider.value, starRotationSlider.value);
    });

    downloadBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'profile-image.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});