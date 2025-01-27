import {ConcatOperator, Settings, WebSettings} from "@/app/settings.ts";
import toRegexRange from "to-regex-range";

export function generateWaystoneRegex(settings: Settings, webSettings: WebSettings): string {

  const result = [
    generateTierRegex(settings.waystone.tier),
    generateModifiers(settings.waystone.modifier),
    generateDropChanceRegex(settings.waystone.modifier.dropChance),
    settings.waystone.resultSettings.customText || null,
  ].filter((e) => e !== null && e!== "");

  if(webSettings.concatOp == ConcatOperator.OR) {
    return result.length > 0 ? `"${result.join("|")}"` : "";
  }
  else if(webSettings.concatOp == ConcatOperator.AND)
  {
    return result.length > 0 ? (result.map((result) => {return "\"" + result + "\"";})).join("") : "";
  }
  else {
    return "";
  }
}

function generateDropChanceRegex(settings: Settings["waystone"]["modifier"]["dropChance"]): string | null {
  const loLimit = settings.loLimitDropChance;
  const hiLimit = settings.hiLimitDropChance;

  if( loLimit <= 0 || hiLimit <= 0 ||
      loLimit >= settings.maxDropChance ||
      hiLimit > settings.maxDropChance ||
      loLimit > hiLimit ||
      (loLimit <= 1 && hiLimit >= settings.maxDropChance)) {
    return null;
  }

  const regex = toRegexRange(loLimit, hiLimit, { capture: false, shorthand: true, relaxZeros: true });
  return `nce: \\+${regex}`;
}

function generateTierRegex(settings: Settings["waystone"]["tier"]): string | null {
  const loLimit = settings.loLimitTier;
  const hiLimit = settings.hiLimitTier;

  if( loLimit <= 0 || hiLimit <= 0 ||
      loLimit >= settings.maxTier ||
      hiLimit > settings.maxTier ||
      loLimit > hiLimit ||
      (loLimit <= 1 && hiLimit >= settings.maxTier)) {
    return null;
  }

  const regex = toRegexRange(loLimit, hiLimit, { capture: true, shorthand: true, relaxZeros: true });
  return `er: ${regex}`;
}

function generateModifiers(settings: Settings["waystone"]["modifier"]): string | null {
  const goodMods = [
    settings.dropOver200 ? ": \\+[2-9]\\d\\d" : null,
    settings.quant50 ? "[5-9]\\d+\\D{12}q" : null,
    settings.rarity50 ? "[5-9]\\d+\\D{12}r" : null,
    settings.experience50 ? "[5-9]\\d+\\D{12}ex" : null,
    settings.rareMonsters50 ? "[5-9]\\d+\\D{22}r" : null,
    settings.monsterPack50 ? "[5-9]\\d+\\D{22}m" : null,
    settings.packSize50 ? "[5-9]\\d+\\D{12}m" : null,
    settings.additionalEssence ? "sen" : null,
    settings.delirious ? "delir" : null,
  ].filter((e) => e !== null).join("|");

  const badMods = [
    settings.burningGround ? "f bur" : null,
    settings.shockedGround ? "ho" : null,
    settings.chilledGround ? "lled" : null,
    settings.eleWeak ? "l wea" : null,
    settings.lessRecovery ? "s r" : null,
    settings.pen ? "pene" : null,
  ].filter((e) => e !== null).join("|");

  return [
    goodMods.length > 0 ? `${goodMods}` : null,
    badMods.length > 0 ? `!${badMods}` : null,
  ].filter((e) => e !== null).join(" ");
}
