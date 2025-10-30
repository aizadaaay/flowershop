$(document).ready(function() {
    let cart = [];

    // 🛒 Добавление товара в корзину
    $(".add-to-cart").click(function() {
        const name = $(this).data("name");
        const price = parseInt($(this).data("price"));
        cart.push({ name, price });
        updateCart();

        $("#add-success").stop(true, true).fadeIn(300).delay(1500).fadeOut(400);
    });

    // 🧺 Открыть корзину
    $("#open-cart").click(function() {
        $("#cart-modal").fadeIn(300);
    });

    // ❌ Закрыть корзину
    $(".close").click(function() {
        $("#cart-modal").fadeOut(300);
    });

    
    function updateCart() {
        $("#cart-items").empty();
        let total = 0;

        cart.forEach((item, index) => {
            $("#cart-items").append(`
                <li>
                    ${item.name} — ${item.price} тг
                    <button class="remove-item" data-index="${index}">🗑️</button>
                </li>
            `);
            total += item.price;
        });

        $("#total").text("Итого: " + total + " тг");
        $("#cart-count").text(cart.length);
    }


    $(document).on("click", ".remove-item", function() {
        const index = $(this).data("index");
        cart.splice(index, 1);
        updateCart();
    });


    $("input[name='payment']").change(function() {
        if ($(this).val() === "card") {
            $("#card-fields").slideDown(300);
        } else {
            $("#card-fields").slideUp(300);
        }
    });

    $("#checkout-form").on("submit", function(e) {
        e.preventDefault();

        const name = $("#buyer-name").val().trim();
        const email = $("#buyer-email").val().trim();
        const address = $("#buyer-address").val().trim();
        const payment = $("input[name='payment']:checked").val();
        const cardNumber = $("#card-number").val().trim();

        let isValid = name && email.includes("@") && address && cart.length > 0;

        if (payment === "card") {
            isValid = isValid && /^\d{16}$/.test(cardNumber);
        }

        if (isValid) {
           
            let orderDetails = cart.map(item => `${item.name} — ${item.price} тг`).join("\n");
            let totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

            const formData = {
                access_key: "478e9d4f-db22-49b9-9041-7d27007a0eb8",
                name: name,
                email: email,
                message: `
💐 Новый заказ:
-------------------------
Имя получателя: ${name}
Адрес доставки: ${address}
Способ оплаты: ${payment === "card" ? "Карта" : "Наличные"}
-------------------------
Заказанные цветы:
${orderDetails}
-------------------------
ИТОГО: ${totalPrice} тг
`
            };

            $.ajax({
                url: "https://api.web3forms.com/submit",
                method: "POST",
                data: formData,
                success: function() {
                    $("#order-success").stop(true, true).fadeIn(400).delay(3000).fadeOut(400);
                    cart = [];
                    updateCart();
                    $("#checkout-form")[0].reset();
                },
                error: function() {
                    $("#order-error").stop(true, true).fadeIn(400).delay(3000).fadeOut(400);
                }
            });
        } else {
            $("#order-error").stop(true, true).fadeIn(400).delay(3000).fadeOut(400);
        }
    });

   
    $("#contact-form").on("submit", function(e) {
        e.preventDefault();
        $.ajax({
            url: $(this).attr("action"),
            method: "POST",
            data: $(this).serialize(),
            success: function() {
                $("#form-message").fadeIn(300).delay(2000).fadeOut(300);
                $("#contact-form")[0].reset();
            }
        });
    });
});


const modal = document.querySelector(".modal-content");
let isDragging = false, offsetX, offsetY;

modal.addEventListener("mousedown", e => {
  isDragging = true;
  offsetX = e.clientX - modal.getBoundingClientRect().left;
  offsetY = e.clientY - modal.getBoundingClientRect().top;
  modal.style.transition = "none";
  modal.style.cursor = "grabbing";
});

document.addEventListener("mousemove", e => {
  if (isDragging) {
    modal.style.left = `${e.clientX - offsetX}px`;
    modal.style.top = `${e.clientY - offsetY}px`;
    modal.style.transform = "translate(0,0)";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  modal.style.transition = "0.3s";
  modal.style.cursor = "default";
});


$(window).on("scroll", function() {
  if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
    $("footer").addClass("visible");
  }
});
