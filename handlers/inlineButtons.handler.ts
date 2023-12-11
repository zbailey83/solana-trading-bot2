import { Composer, Context, InlineKeyboard } from "grammy";
import { createToken } from "../views/create_token.view";
import { MyContext } from "../bot";
import { SafeToken, TokenDeployer } from "../web3";
import { CreateWallet } from "../web3";
import { setSessions } from ".";
import { ethers } from "ethers";
import {
	DecimalObject,
	TotalSupplyObject,
	finalTaxObject,
	initTaxObject,
	objectModifier,
	trimAddress,
} from "../utils";
import { myState } from "../utils";
import {
	decimalMenu,
	finalTaxMenu,
	initTaxMenu,
	mangeTokenMenu,
	totalSupplyKeyBoard,
} from "../views";
import { MangeTokenHandler } from "./mangeToken.handler";
const Wallet = new CreateWallet();
const { WalletSigner } = Wallet;
async function goToIniTaxMenu(ctx: MyContext) {
	await ctx.deleteMessage();
	await ctx.reply(`Total Supply Set to: ${ctx.session.totalSupply} ✅`);
	await ctx.reply("Set Inital Tax ", { reply_markup: initTaxMenu });
}
async function goToFinalTax(ctx: MyContext) {
	await ctx.deleteMessage();
	await ctx.reply(`Initial Tax is Set to: ${ctx.session.initTax} ✅`);

	await ctx.reply("Set Final Tax ", { reply_markup: finalTaxMenu });
}
async function gotoDecimal(ctx: MyContext) {
	await ctx.deleteMessage();
	await ctx.reply(`Final Tax is Set to: ${ctx.session.finTax} ✅`);

	await ctx.reply("Set Token Decimal ", { reply_markup: decimalMenu });
}
async function goToSetTokenMetadata(ctx: MyContext) {
	await ctx.deleteMessage();
	await ctx.reply(`Token Decimal is Set to: ${ctx.session.tokendecimal} ✅`);
	await ctx.conversation.enter("setTokenMetadataConversation");
}
async function returnTo(title: string, menu: InlineKeyboard, ctx: MyContext) {
	await ctx.deleteMessage();
	await ctx.reply(title, { reply_markup: menu });
}
const CallBackMap: Map<string, any> = new Map();
const TotalSupplyMap: Map<string, any> = new Map();
CallBackMap.set("create-token", async (ctx: MyContext) => {
	await myState.setDefaultState(ctx.chat?.id?.toString());
	ctx.deleteMessage();
	createToken(ctx);
});
CallBackMap.set("null", async (ctx) => {
	return null;
});
TotalSupplyMap.set(
	"total-supply",
	async (ctx: MyContext, totalSupplyAmount: string) => {
		const query = totalSupplyAmount.split("|");
		if (query[1] === "custom") {
			await ctx.conversation.enter("setCustomTotalSupply");
		} else if (query[1] == "return") {
			console.log("Welcome");
		} else {
			const getUserState = await myState.getStore(
				ctx.chat?.id?.toString()
			);
			ctx.session.isSetTotalSupply = true;
			ctx.session.totalSupply = TotalSupplyObject[query[1]];
			await myState.setStore(
				ctx.chat?.id?.toString(),
				objectModifier(
					getUserState,
					"totalSupply",
					ctx.session.totalSupply
				)
			);
			goToIniTaxMenu(ctx);
		}
	}
);
TotalSupplyMap.set(
	"init-tax",
	async (ctx: MyContext, callbackquery: string) => {
		const query = callbackquery.split("|");

		if (query[1] === "custom") {
			await ctx.conversation.enter("setCustomInitTax");
		} else if (query[1] == "return") {
			//	console.log("Welcome");
			returnTo("Set Total Supply", totalSupplyKeyBoard, ctx);
		} else {
			const getUserState = await myState.getStore(
				ctx.chat?.id?.toString()
			);
			ctx.session.isSetTotalSupply = true;
			ctx.session.initTax = initTaxObject[query[1]];
			await myState.setStore(
				ctx.chat?.id?.toString(),
				objectModifier(getUserState, "initTax", ctx.session.initTax)
			);
			goToFinalTax(ctx);
		}
	}
);
TotalSupplyMap.set(
	"final-tax",
	async (ctx: MyContext, callbackquery: string) => {
		const query = callbackquery.split("|");
		if (query[1] === "custom") {
			await ctx.conversation.enter("setCustomFinalTaxConversation");
		} else if (query[1] == "return") {
			//console.log("Welcome");
			returnTo("Set Initial Tax:", initTaxMenu, ctx);
		} else {
			const getUserState = await myState.getStore(
				ctx.chat?.id?.toString()
			);
			ctx.session.isSetTotalSupply = true;
			ctx.session.finTax = finalTaxObject[query[1]];
			await myState.setStore(
				ctx.chat?.id?.toString(),
				objectModifier(getUserState, "finTax", ctx.session.finTax)
			);
			gotoDecimal(ctx);
		}
	}
);
TotalSupplyMap.set("decimal", (ctx: MyContext, callbackquery: string) => {
	const query = callbackquery.split("|");
	if (query[1] === "custom") {
		//ctx.conversation.enter("setCustomInitTax");
	} else if (query[1] == "return") {
		//console.log("Welcome");
		returnTo("Set Initial Tax:", initTaxMenu, ctx);
	} else {
		ctx.session.isSetTotalSupply = true;
		ctx.session.tokendecimal = DecimalObject[query[1]];
		goToSetTokenMetadata(ctx);
	}
});

const callBackQueryComposer = new Composer<MyContext>();
callBackQueryComposer.on("callback_query:data", async (ctx) => {
	const data = ctx.callbackQuery.data;
	const totalSupplyQuery = data.split("|")[0];
	await setSessions(ctx as any);

	if (data === "cancel") {
		console.log("cancel");
	}
	if (data.includes("buy-")) {
		console.log("buy");
	}

	await ctx.answerCallbackQuery();
});
export { callBackQueryComposer };
