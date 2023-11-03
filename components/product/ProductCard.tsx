import type { Platform } from "$store/apps/site.ts";
import { SendEventOnClick } from "$store/components/Analytics.tsx";
import Avatar from "$store/components/ui/Avatar.tsx";
import WishlistButton from "$store/islands/WishlistButton.tsx";
import { formatPrice } from "$store/sdk/format.ts";
import { useOffer } from "$store/sdk/useOffer.ts";
import { useVariantPossibilities } from "$store/sdk/useVariantPossiblities.ts";
import type { Product } from "apps/commerce/types.ts";
import { mapProductToAnalyticsItem } from "apps/commerce/utils/productToAnalyticsItem.ts";
import Image from "apps/website/components/Image.tsx";

export interface Layout {
  basics?: {
    contentAlignment?: "Left" | "Center";
    iconPosition?: "Left" | "Center";
    oldPriceSize?: "Small" | "Normal";
    newPriceSize?: "Normal" | "Big";
    productTitleSize?: "Normal" | "Big";
    ctaText?: string;
  };
  elementsPositions?: {
    skuSelector?: "Top" | "Bottom";
    favoriteIcon?: "Top right" | "Top left";
  };
  hide?: {
    productName?: boolean;
    productDescription?: boolean;
    allPrices?: boolean;
    installments?: boolean;
    skuSelector?: boolean;
    cta?: boolean;
  };
  onMouseOver?: {
    image?: "Change image" | "Zoom image";
    card?: "None" | "Move up";
    showFavoriteIcon?: boolean;
    showSkuSelector?: boolean;
    showCardShadow?: boolean;
    showCta?: boolean;
  };
}

interface Props {
  /** @ignore **/
  product: Product;
  /** Preload card image */
  preload?: boolean;

  /** @description used for analytics event */
  itemListName?: string;

  /** @description index of the product card in the list */
  index?: number;

  layout?: Layout;

  platform?: Platform;
}

const relative = (url: string) => {
  const link = new URL(url);
  return `${link.pathname}${link.search}`;
};

const WIDTH = 200;
const HEIGHT = 279;

function ProductCard({
  product,
  preload,
  itemListName,
  layout,
  platform,
  index,
}: Props) {
  const { url, productID, name, image: images, offers, isVariantOf } = product;
  const id = `product-card-${productID}`;
  const hasVariant = isVariantOf?.hasVariant ?? [];
  const productGroupID = isVariantOf?.productGroupID;
  const description = product.description || isVariantOf?.description;
  const [front, back] = images ?? [];
  const { listPrice, price, installments } = useOffer(offers);
  const possibilities = useVariantPossibilities(hasVariant, product);
  const variants = Object.entries(Object.values(possibilities)[0] ?? {});

  const l = layout;
  const align =
    !l?.basics?.contentAlignment || l?.basics?.contentAlignment == "Left"
      ? "left"
      : "center";
  const skuSelector = variants.map(([value, link]) => (
    <option>
      <a href={link}>{value}</a>
    </option>
  ));
  const cta = (
    <a
      href={url && relative(url)}
      aria-label="view product"
      class="btn btn-block"
    >
      {l?.basics?.ctaText || "Ver produto"}
    </a>
  );

  const [priceFlex, priceFontSize, hiddenSpan, spanSize] =
    l?.basics?.newPriceSize === "Normal"
      ? ["lg:flex-row", "lg:text-xl", "hidden", ""]
      : ["lg:flex-col", "lg:text-3xl", "", "lg:text-lg"];

  const [flexCard, imageMin] =
    l?.basics?.iconPosition === "Center"
      ? ["flex-col", ""]
      : ["flex-row", "min-w-[120px]"];

  return (
    <div
      id={id}
      class={`card card-compact group w-full ${
        align === "center" ? "text-center" : "text-start"
      } ${l?.onMouseOver?.showCardShadow ? "lg:hover:card-bordered" : ""}
        ${
          l?.onMouseOver?.card === "Move up" &&
          "duration-500 transition-translate ease-in-out lg:hover:-translate-y-2"
        }
        ${flexCard}
      `}
      data-deco="view-product"
    >
      {/* <SendEventOnClick
        id={id}
        event={{
          name: "select_item" as const,
          params: {
            item_list_name: itemListName,
            items: [
              mapProductToAnalyticsItem({
                product,
                price,
                listPrice,
                index,
              }),
            ],
          },
        }}
      /> */}
      <div id="figure" class={imageMin}>
        <figure
          class="relative overflow-hidden"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        >
          {/* Wishlist button */}
          <div
            class={`absolute top-2 z-10
          ${
            l?.elementsPositions?.favoriteIcon === "Top left"
              ? "left-2"
              : "right-2"
          }
          ${
            l?.onMouseOver?.showFavoriteIcon
              ? "lg:hidden lg:group-hover:block"
              : "lg:hidden"
          }
        `}
          >
            {/* {platform === "vtex" && (
            <WishlistButton
              productGroupID={productGroupID}
              productID={productID}
            />
          )} */}
          </div>
          {/* Product Images */}
          <a
            href={url && relative(url)}
            aria-label="view product"
            class="grid grid-cols-1 grid-rows-1 w-full"
          >
            <Image
              src={front.url!}
              alt={front.alternateName}
              width={WIDTH}
              height={HEIGHT}
              class={`bg-base-100 col-span-full row-span-full rounded w-full ${
                l?.onMouseOver?.image == "Zoom image"
                  ? "duration-100 transition-scale scale-100 lg:group-hover:scale-125"
                  : ""
              }`}
              sizes="(max-width: 640px) 50vw, 20vw"
              preload={preload}
              loading={preload ? "eager" : "lazy"}
              decoding="async"
            />
            {(!l?.onMouseOver?.image ||
              l?.onMouseOver?.image == "Change image") && (
              <Image
                src={back?.url ?? front.url!}
                alt={back?.alternateName ?? front.alternateName}
                width={WIDTH}
                height={HEIGHT}
                class="bg-base-100 col-span-full row-span-full transition-opacity rounded w-full opacity-0 lg:group-hover:opacity-100"
                sizes="(max-width: 640px) 50vw, 20vw"
                loading="lazy"
                decoding="async"
              />
            )}
          </a>
          <figcaption
            class={`
          absolute bottom-1 left-0 w-full flex flex-col gap-3 p-2 ${
            l?.onMouseOver?.showSkuSelector || l?.onMouseOver?.showCta
              ? "transition-opacity opacity-0 lg:group-hover:opacity-100"
              : "lg:hidden"
          }`}
          >
            {/* SKU Selector */}
            {l?.onMouseOver?.showSkuSelector && (
              <ul class="flex justify-center items-center gap-2 w-full">
                {skuSelector}
              </ul>
            )}
            {l?.onMouseOver?.showCta && cta}
          </figcaption>
        </figure>
      </div>
      {/* Prices & Name */}
      <div class="flex-auto flex flex-col p-2 gap-3">
        {/* SKU Selector */}
        {(!l?.elementsPositions?.skuSelector ||
          l?.elementsPositions?.skuSelector === "Top") && (
          <>
            {l?.hide?.skuSelector ? (
              ""
            ) : (
              <div
                class={`flex items-center gap-2 w-full ${
                  align === "center" ? "justify-center" : "justify-start"
                } ${l?.onMouseOver?.showSkuSelector ? "lg:hidden" : ""}`}
              >
                <select
                  id="countries"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm block w-full p-2.5"
                >
                  <option selected>Escolha um tamanho</option>
                  {skuSelector}
                </select>
              </div>
            )}
          </>
        )}

        {l?.hide?.productName && l?.hide?.productDescription ? (
          ""
        ) : (
          <div class="flex flex-col gap-0">
            {l?.hide?.productName ? (
              ""
            ) : (
              <span
                class={`truncate text-base-content ${
                  l?.basics?.productTitleSize === "Normal"
                    ? "text-base"
                    : "text-xl"
                }`}
                dangerouslySetInnerHTML={{ __html: name?.toUpperCase() ?? "" }}
              />
            )}
            {l?.hide?.productDescription ? (
              ""
            ) : (
              <div
                class="truncate text-sm lg:text-sm text-neutral"
                dangerouslySetInnerHTML={{ __html: description ?? "" }}
              />
            )}
          </div>
        )}
        {l?.hide?.allPrices ? (
          ""
        ) : (
          <div class="flex flex-col gap-1">
            <div
              class={`flex flex-col gap-0 lg:gap-1 ${
                align === "center" ? "justify-center" : "justify-between"
              } ${priceFlex}`}
            >
              <div
                class={`line-through text-base-300 text-sm mt-auto ${
                  l?.basics?.oldPriceSize === "Normal" ? "lg:text-xl" : ""
                }`}
              >
                {formatPrice(listPrice, offers?.priceCurrency)}
              </div>
              <div class={`text-accent text-base ${priceFontSize}`}>
                <span class={spanSize}>
                  <span class={hiddenSpan}>Por </span>R${" "}
                </span>
                {price!.toFixed(2).replace(".", ",")}
              </div>
            </div>
            {l?.hide?.installments ? (
              ""
            ) : (
              <div
                class="text-base-300 text-sm lg:text-base truncate"
                dangerouslySetInnerHTML={{ __html: installments ?? "" }}
              ></div>
            )}
          </div>
        )}

        {/* SKU Selector */}
        {l?.elementsPositions?.skuSelector === "Bottom" && (
          <>
            {l?.hide?.skuSelector ? (
              ""
            ) : (
              <div
                class={`flex items-center gap-2 w-full ${
                  align === "center" ? "justify-center" : "justify-start"
                } ${l?.onMouseOver?.showSkuSelector ? "lg:hidden" : ""}`}
              >
                <select
                  id="countries"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm block w-full p-2.5"
                >
                  <option selected>Escolha um tamanho</option>
                  {skuSelector}
                </select>
              </div>
            )}
          </>
        )}

        {!l?.hide?.cta ? (
          <div
            class={`flex-auto flex items-end ${
              l?.onMouseOver?.showCta ? "lg:hidden" : ""
            }`}
          >
            {cta}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default ProductCard;
