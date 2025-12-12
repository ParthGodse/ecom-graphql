// src/resolvers.js
const prisma = require('./db');

const resolvers = {
  Query: {
    products: (_, { search, skip = 0, take = 50 }) =>
      prisma.product.findMany({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
        skip,
        take,
      }),
    product: (_, { id }) => prisma.product.findUnique({ where: { id: Number(id) } }),
    cart: (_, { userId }) =>
      prisma.cart.findFirst({
        where: { userId: Number(userId) },
        include: { items: { include: { product: true } } },
      }),
    orders: (_, { userId }) =>
      prisma.order.findMany({ where: { userId: Number(userId) }, include: { items: true } }),
    order: (_, { id }) => prisma.order.findUnique({ where: { id: Number(id) }, include: { items: true } }),
  },

  Mutation: {
    addToCart: async (_, { input }) => {
      let cart = await prisma.cart.findFirst({ where: { userId: Number(input.userId) } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: Number(input.userId) } });
      }

      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: Number(input.productId) },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + Number(input.quantity) },
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId: Number(input.productId), quantity: Number(input.quantity) },
        });
      }

      return prisma.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: true } } },
      });
    },

    removeFromCart: async (_, { itemId }) => {
      const item = await prisma.cartItem.findUnique({ where: { id: Number(itemId) } });
      if (!item) throw new Error('Cart item not found');

      const cartId = item.cartId;
      await prisma.cartItem.delete({ where: { id: Number(itemId) } });

      return prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } },
      });
    },

    checkout: async (_, { userId }) => {
      const cart = await prisma.cart.findFirst({
        where: { userId: Number(userId) },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) throw new Error('Cart empty');

      let total = 0;
      for (const it of cart.items) {
        if (it.product.inventory < it.quantity) throw new Error(`Not enough inventory for ${it.product.name}`);
        total += it.product.priceCents * it.quantity;
      }

      const order = await prisma.order.create({
        data: {
          userId: Number(userId),
          totalCents: total,
          items: {
            create: cart.items.map((it) => ({
              productId: it.productId,
              name: it.product.name,
              priceCents: it.product.priceCents,
              quantity: it.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Transaction: decrement inventory & clear cart items
      const ops = cart.items.map((it) =>
        prisma.product.update({
          where: { id: it.productId },
          data: { inventory: { decrement: it.quantity } },
        })
      );
      ops.push(prisma.cartItem.deleteMany({ where: { cartId: cart.id } }));

      await prisma.$transaction(ops);

      return order;
    },
  },

  CartItem: {
    product: (parent) => prisma.product.findUnique({ where: { id: parent.productId } }),
  },
};

module.exports = resolvers;
