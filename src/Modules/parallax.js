'use strict';

window.onload = () => {
  const parallax = document.querySelector('.parallax');

  if (parallax) {
    const clouds = document.querySelector('.images-parallax__clouds');
    const mountains = document.querySelector('.images-parallax__mountains');
    const human = document.querySelector('.images-parallax__human');
    const content = document.querySelector('.parallax__container');

    const forClouds = 10;
    const forMountains = 25;
    const forHuman = 100;

    const speed = 0.05;

    let positionX = 0;
    let positionY = 0;
    let coordXprocent = 0;
    let coordYprocent = 0;

    const setMouseParallaxStyle = () => {
      const distX = coordXprocent - positionX;
      const distY = coordYprocent - positionY;

      positionX = positionX + distX * speed;
      positionY = positionY + distY * speed;

      clouds.style.cssText = `transform: translate(${positionX / forClouds}%,${
        positionY / forClouds
      }%);`;

      mountains.style.cssText = `transform: translate(${
        positionX / forMountains
      }%,${positionY / forMountains}%);`;

      human.style.cssText = `transform: translate(${positionX / forHuman}%,${
        positionY / forHuman
      }%);`;
      requestAnimationFrame(setMouseParallaxStyle);
    };

    setMouseParallaxStyle();

    parallax.addEventListener('mousemove', (e) => {
      const parallaxWidth = parallax.offsetWidth;
      const parallaxHeight = parallax.offsetHeight;

      const coordX = e.pageX - parallaxWidth / 2;
      const coordY = e.pageY - parallaxHeight / 2;

      coordXprocent = (coordX / parallaxWidth) * 100;
      coordYprocent = (coordY / parallaxHeight) * 100;
    });

    let threshold = [];
    for (let i = 0; i <= 1.0; i += 0.005) {
      threshold.push(i);
    }

    const setParallaxItemStyle = (scrollTopPercent) => {
      content.style.cssText = `transform: translate( 0%, -${
        scrollTopPercent / 1
      }%);`;
      // mountains.parentElement.style.cssText = `transform: translate(0%, -${
      // scrollTopPercent / 6
      // }%);`;
      // human.parentElement.style.transform = `translate(0%, -${
      // scrollTopPercent / 3
      // }%);`;
    };

    const observer = new IntersectionObserver(
      () => {
        const scrollTopPercent =
          (window.pageYOffset / parallax.offsetHeight) * 100;
        setParallaxItemStyle(scrollTopPercent);
      },
      { threshold }
    );
    observer.observe(document.querySelector('.content'));
  }
};
