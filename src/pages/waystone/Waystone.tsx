import {Header} from "@/components/header/Header.tsx";
import {Result} from "@/components/result/Result.tsx";
import {defaultSettings, Settings, defaultWebSettings, WebSettings} from "@/app/settings.ts";
import {useEffect, useState} from "react";
import {loadSettings, saveSettings, selectedProfile, loadWebSettings, saveWebSettings} from "@/lib/localStorage.ts";
import {generateWaystoneRegex} from "@/pages/waystone/WaystoneResult.ts";
import {Input} from "@/components/ui/input.tsx";
import {Checked} from "@/components/checked/Checked.tsx";

export function Waystone(){
  const globalSettings = loadSettings(selectedProfile())
  const globalWebSettings = loadWebSettings()
  const [settings, setSettings] = useState<Settings["waystone"]>(globalSettings.waystone);
  const [webSettings, setWebSettings] = useState<WebSettings>(globalWebSettings);
  const [result, setResult] = useState("");

  useEffect(() => {
    const settingsResult = {...globalSettings, waystone: {...settings}};
    const webSettingsResult = {...globalWebSettings, ...webSettings};
    saveSettings(settingsResult);
    saveWebSettings(webSettingsResult);
    setResult(generateWaystoneRegex(settingsResult, webSettingsResult));
  }, [settings, webSettings]);

  return (
    <>
      <Header name="Waystone Regex"></Header>
      <div className="flex bg-muted grow-0 flex-1 flex-col gap-2 ">
        <Result
          result={result}
          reset={() => {
            setSettings(defaultSettings.waystone);
            setWebSettings(defaultWebSettings);
          }}
          customText={settings.resultSettings.customText}
          autoCopy={settings.resultSettings.autoCopy}
          setCustomText={(text) => {
            setSettings({
              ...settings, resultSettings: {...settings.resultSettings, customText: text,}
            })
          }}
          setAutoCopy={(enable) => {
            setSettings({
              ...settings, resultSettings: {...settings.resultSettings, autoCopy: enable,}
            })
          }}
          concatOp={webSettings.concatOp}
          setConcatOperation={(op) => {
            setWebSettings({
              ...webSettings, concatOp: op
            })
          }}
        />
      </div>
      <div className="flex grow bg-muted/30 flex-1 flex-col gap-2 p-4">
        <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-sidebar-foreground/70 pb-2">Tier</p>
            <p className="text-xs pb-2">Minimum tier:</p>
            <Input type="number" min="1" max="16" placeholder="Min tier" className="pb-2 mb-2 w-40"
                  value={settings.tier.loLimitTier}
                  onChange={(b) => {
                    if(Number(b.target.value) <= settings.tier.hiLimitTier) {
                      setSettings({
                        ...settings, tier: {...settings.tier, loLimitTier: Math.min(Number(b.target.value), settings.tier.maxTier) || 1}
                      })
                    }
                  }}
            />
            <p className="text-xs pb-2">Maximum tier:</p>
            <Input type="number" min="1" max="16" placeholder="Max tier" className="pb-2 mb-2 w-40"
                  value={settings.tier.maxTier}
                  onChange={(b) => {
                    if(Number(b.target.value) >= settings.tier.loLimitTier) { 
                      setSettings({
                        ...settings, tier: {...settings.tier, hiLimitTier: Math.min(Number(b.target.value), settings.tier.maxTier) || settings.tier.maxTier}
                      })
                    }
                  }}
            />
          <p className="text-xs font-medium text-sidebar-foreground/70 pb-2 pt-4">Waystone drop chance (max. {settings.modifier.dropChance.maxDropChance})</p>
          <p className="text-xs pb-2">Min dropchance:</p>
            <Input type="number" min="1" max={settings.modifier.dropChance.hiLimitDropChance} placeholder="Min drop chance" className="pb-2 mb-2 w-40"
                  value={settings.modifier.dropChance.loLimitDropChance}
                  onChange={(b) => {
                    setSettings({
                      ...settings, modifier: {
                        ...settings.modifier, dropChance: {
                          ...settings.modifier.dropChance,
                          loLimitDropChance: Number(b.target.value) || 1
                        }                          
                      }
                    })
                  }}
            />
            <p className="text-xs pb-2">Max dropchance:</p>
            <Input type="number" min="1" max={settings.modifier.dropChance.maxDropChance} placeholder="Max drop chance" className="pb-2 mb-2 w-40"
                  value={settings.modifier.dropChance.hiLimitDropChance}
                  onChange={(b) => {
                    setSettings({
                        ...settings, modifier: {
                          ...settings.modifier, dropChance: {
                            ...settings.modifier.dropChance,
                            hiLimitDropChance: Number(b.target.value) || settings.modifier.dropChance.maxDropChance
                          }                          
                        }
                      })
                    }}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-sidebar-foreground/70 pb-2">Good modifiers (will match any selected)</p>
            <Checked id="mod-drop-over-200" text="Waystone drop chance over 200%+" checked={settings.modifier.dropOver200}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {
                        ...settings.modifier,
                        dropOver200: b
                      }
                     })}
            />
            <Checked id="mod-quant50" text="50%+ quantity of items" checked={settings.modifier.quant50}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, quant50: b}
                     })}
            />
            <Checked id="mod-rarity50" text="50%+ rarity of items" checked={settings.modifier.rarity50}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, rarity50: b}
                     })}
            />
            <Checked id="mod-experience" text="50%+ experience gain" checked={settings.modifier.experience50}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, experience50: b}
                     })}
            />
            <Checked id="mod-raremonster" text="50%+ rare monsters" checked={settings.modifier.rareMonsters50}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, rareMonsters50: b}
                     })}
            />
            <Checked id="mod-monsterpack" text="50%+ monster packs" checked={settings.modifier.monsterPack50}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, monsterPack50: b}
                     })}
            />
            <Checked id="mod-magicpack" text="50%+ magic pack size" checked={settings.modifier.packSize50}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, packSize50: b}
                     })}
            />
            <Checked id="mod-raremonster" text="Additional essence" checked={settings.modifier.additionalEssence}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, additionalEssence: b}
                     })}
            />
            <Checked id="mod-delirium" text="Players in area are X% Delirious" checked={settings.modifier.delirious}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, delirious: b}
                     })}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-sidebar-foreground/70 pb-2">Bad modifiers (will not highlight maps with these modifiers)</p>
            <Checked id="mod-burningground" text="Burning ground" checked={settings.modifier.burningGround}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, burningGround: b}
                     })}
            />
            <Checked id="mod-shockedground" text="Shocked ground" checked={settings.modifier.shockedGround}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, shockedGround: b}
                     })}
            />
            <Checked id="mod-chilledground" text="Chilled ground" checked={settings.modifier.chilledGround}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, chilledGround: b}
                     })}
            />
            <Checked id="mod-eleweak" text="Elemental weakness" checked={settings.modifier.eleWeak}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, eleWeak: b}
                     })}
            />
            <Checked id="mod-lessrecovery" text="Player less recovery rate life/shield" checked={settings.modifier.lessRecovery}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, lessRecovery: b}
                     })}
            />
            <Checked id="mod-pen" text="Monster damage penetrate resistances" checked={settings.modifier.pen}
                     onChange={(b) => setSettings({
                       ...settings, modifier: {...settings.modifier, pen: b}
                     })}
            />
          </div>
        </div>
      </div>
    </>
  )
}
