'use client'

import { useEffect, useState } from 'react'
import { BellPlus, MapPin, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { City } from '@/lib/types'

interface LocalityAlert {
  id: string
  city_id: string | null
  locality: string
  city?: City | null
}

export function LocalityAlertManager() {
  const supabase = createClient()
  const [cities, setCities] = useState<City[]>([])
  const [alerts, setAlerts] = useState<LocalityAlert[]>([])
  const [cityId, setCityId] = useState('')
  const [locality, setLocality] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const [{ data: cityData }, { data: alertData }] = await Promise.all([
        supabase.from('cities').select('*').eq('is_active', true).order('name'),
        supabase.from('user_locality_alerts').select('*, city:cities(*)').order('created_at', { ascending: false }),
      ])

      setCities((cityData as City[]) || [])
      setAlerts((alertData as LocalityAlert[]) || [])
    }

    void loadData()
  }, [supabase])

  const addAlert = async () => {
    const trimmedLocality = locality.trim()
    if (!cityId || !trimmedLocality) {
      toast.error('Choose a city and locality first.')
      return
    }

    const { data, error } = await supabase
      .from('user_locality_alerts')
      .insert({
        city_id: cityId,
        locality: trimmedLocality,
        locality_key: trimmedLocality.toLowerCase(),
      })
      .select('*, city:cities(*)')
      .single()

    if (error) {
      toast.error('Could not save this locality alert.')
      return
    }

    setAlerts((prev) => [data as LocalityAlert, ...prev])
    setLocality('')
    toast.success('Locality alert added.')
  }

  const removeAlert = async (id: string) => {
    const { error } = await supabase.from('user_locality_alerts').delete().eq('id', id)
    if (error) {
      toast.error('Could not remove this alert.')
      return
    }

    setAlerts((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellPlus className="h-5 w-5" />
          Locality Alerts
        </CardTitle>
        <CardDescription>
          Get notified when new properties are posted in the localities you care about.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="alert-city">City</Label>
            <Select value={cityId} onValueChange={setCityId}>
              <SelectTrigger id="alert-city" className="mt-1.5">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="alert-locality">Locality</Label>
            <Input
              id="alert-locality"
              className="mt-1.5"
              placeholder="e.g. Whitefield"
              value={locality}
              onChange={(event) => setLocality(event.target.value)}
            />
          </div>
        </div>

        <Button onClick={addAlert}>Save Alert</Button>

        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{alert.locality}</p>
                    <p className="text-sm text-muted-foreground">{alert.city?.name || 'Any city'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAlert(alert.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No locality alerts saved yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
