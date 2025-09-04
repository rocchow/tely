"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, startTransition } from "react";
import { ArrowUp, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  commerceGPTRevalidateAction,
  setInitialCartCookiesAction,
} from "@/actions/cart-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductList } from "./commercegpt/product-list";
import { YnsLink } from "./yns-link";

type CartEvent = { operation?: "cartAdd"; cartId: string };

export function CommerceGPT() {
  // v5: use sendMessage; stream extra "data parts" via onData
  const [dataParts, setDataParts] = useState<any[]>([]);
  const { messages, sendMessage, isLoading, error, clearError } = useChat({
    // collect any streamed data parts
    onData(part) {
      // part is a DataUIPart; its exact shape depends on what your /api/chat sends
      // we just stash it; you can refine this if you control the server shape
      setDataParts((prev) => [...prev, (part as any).data ?? part]);
    },
  });

  const [input, setInput] = useState("");

  // look for `{ operation: "cartAdd", cartId }` in streamed data parts
  useEffect(() => {
    // flatten arrays-of-arrays defensively, then find the first cartAdd
    const flat = dataParts.flat();
    const evt = flat.find(
      (x: any) => x && typeof x === "object" && x.operation === "cartAdd" && x.cartId,
    ) as CartEvent | undefined;

    if (evt?.cartId) {
      startTransition(async () => {
        await setInitialCartCookiesAction(evt.cartId, 1);
        await commerceGPTRevalidateAction();
      });
    }
  }, [dataParts]);

  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="bg-linear-to-r from-orange-100 via-orange-200 to-red-300 px-4 py-3 text-indigo-900">
        <div className="flex items-center justify-between gap-x-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-x-4">
            <div className="flex items-center gap-x-4">
              <p className="text-center text-sm font-medium">
                🎉 You can use powerful OpenAI models to search and buy products
              </p>
              <Button
                size="sm"
                className="flex-none rounded-full bg-orange-600 px-3 py-1 text-sm font-semibold text-white shadow-xs hover:bg-orange-700 focus-visible:ring-0"
                onClick={() => {
                  ref.current?.focus();
                  setIsOpen((v) => !v);
                }}
              >
                Commerce GPT <ChevronDown />
              </Button>
            </div>
          </div>
          <YnsLink
            className="bg-black rounded-full text-white px-4 py-1 text-sm"
            href="https://github.com/yournextstore/yournextstore"
            target="_blank"
          >
            View on GitHub
          </YnsLink>
        </div>
      </div>

      <div
        className={`z-[100] overflow-clip fixed top-0 left-0 right-0 bg-neutral-50 transition-all duration-300 ease-in-out shadow-lg ${
          isOpen ? "h-2/3" : "h-0"
        }`}
      >
        <Card className="w-full h-full rounded-none max-w-(--breakpoint-lg) mx-auto border-transparent">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="grow overflow-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center space-y-6 h-full">
                  <h3 className="text-xl font-bold text-center">
                    Welcome to{" "}
                    <span className="bg-linear-to-r from-orange-500 via-red-500 to-red-600 text-transparent bg-clip-text">
                      Commerce GPT
                    </span>{" "}
                    in Your Next Store
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    <Button
                      variant="outline"
                      className="text-lg text-neutral-500"
                      size="lg"
                      onClick={() => sendMessage("Show me some bags")}
                    >
                      Show me some bags
                    </Button>
                    <Button
                      variant="outline"
                      className="text-lg text-neutral-500"
                      size="lg"
                      onClick={() => sendMessage("Show me cool sunglasses")}
                    >
                      Looking for cool glasses
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`text-lg rounded px-2 py-1 max-w-[80%] ${
                      m.role === "user"
                        ? "bg-linear-to-l from-orange-500 via-red-400 to-red-500 text-white"
                        : (m as any).toolInvocations?.length > 0
                        ? "bg-transparent"
                        : "bg-neutral-100"
                    }`}
                  >
                    {typeof (m as any).content === "string"
                      ? (m as any).content
                      : (m as any).content}

                    {(m as any).toolInvocations?.map((ti: any) => {
                      return (
                        ti.state === "result" && (
                          <div key={ti.toolCallId}>
                            {(() => {
                              switch (ti.toolName) {
                                case "productSearch":
                                  if (!ti.output || ti.output.length === 0)
                                    return <>No results</>;
                                  return (
                                    <div className="grid cols-1 gap-4">
                                      <ProductList products={ti.output} />
                                      <div className="flex flex-wrap justify-center gap-2 w-full">
                                        <Button
                                          variant="outline"
                                          className="text-lg text-neutral-500"
                                          size="lg"
                                          onClick={() =>
                                            sendMessage(
                                              "Add the first product to the cart",
                                            )
                                          }
                                        >
                                          Add the first product to the cart
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                default:
                                  return (
                                    <div className="text-lg rounded px-2 py-1 bg-neutral-100">
                                      {typeof ti.output === "string"
                                        ? ti.output
                                        : JSON.stringify(ti.output)}
                                    </div>
                                  );
                              }
                            })()}
                          </div>
                        )
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim().length === 0) return;
                if (error) clearError();
                sendMessage(input);
                setInput("");
              }}
              className="flex space-x-2 items-center"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What do you want to buy today?"
                className="grow h-12 md:text-xl"
                ref={ref}
              />
              <Button
                type="submit"
                size="lg"
                className="rounded-full text-lg h-12"
                disabled={isLoading || input.trim() === ""}
                aria-label="Send"
              >
                <ArrowUp />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity ease-in-out duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
